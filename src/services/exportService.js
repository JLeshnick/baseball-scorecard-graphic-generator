import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

/**
 * Clones the graphic element and captures it as a high-resolution PNG Data URL.
 */
export async function captureGraphic(graphicEl, orientation = 'portrait', totalInnings = 9, pixelRatio = 8) {
  if (!graphicEl) return null;
  const isLandscape = orientation === 'landscape';
  const totalInningsCount = Math.max(9, totalInnings || 9);
  const targetWidth = isLandscape
    ? `${Math.max(1360, 1360 + (totalInningsCount - 9) * 90)}px`
    : '920px';

  const wrapper = document.createElement('div');
  wrapper.style.cssText = [
    'position:fixed',
    'top:-99999px',
    'left:-99999px',
    `width:${targetWidth}`,
    'height:auto',
    'overflow:visible',
    'z-index:-1',
    'pointer-events:none',
  ].join(';');

  const clone = graphicEl.cloneNode(true);
  clone.style.width = targetWidth;
  clone.style.maxWidth = targetWidth;
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.boxShadow = 'none';
  clone.style.backgroundColor = 'transparent';
  clone.style.webkitFontSmoothing = 'antialiased';
  clone.style.mozOsxFontSmoothing = 'grayscale';
  clone.style.textRendering = 'optimizeLegibility';

  // Strip interactive rows, buttons, and no-export markers
  const noExportElements = clone.querySelectorAll('.interactive-add-pitcher-row, .no-export, [data-interactive-only]');
  noExportElements.forEach(el => el.remove());

  // Strip any interactive selection highlights, focus outlines, and live indicator dots from the clone
  const highlightedElements = clone.querySelectorAll('td, th, div, span, tr');
  highlightedElements.forEach(elem => {
    if (elem.style.boxShadow && (elem.style.boxShadow.includes('3b82f6') || elem.style.boxShadow.includes('ef4444') || elem.style.boxShadow.includes('inset'))) {
      elem.style.boxShadow = 'none';
    }
    if (elem.style.backgroundColor && (elem.style.backgroundColor.includes('59, 130, 246') || elem.style.backgroundColor.includes('239, 68, 68'))) {
      elem.style.backgroundColor = 'transparent';
    }
    elem.classList.remove('live-active-atbat-cell', 'interactive-diamond-cell', 'interactive-roster-cell', 'interactive-add-pitcher-row');
    elem.style.outline = 'none';
    elem.style.animation = 'none';
  });

  const liveDots = clone.querySelectorAll('div');
  liveDots.forEach(dot => {
    if (
      dot.style.borderRadius === '50%' &&
      (dot.style.backgroundColor === 'rgb(239, 68, 68)' || dot.style.backgroundColor === '#ef4444' || (dot.style.animation && dot.style.animation.includes('liveDotPulse')))
    ) {
      dot.remove();
    }
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => requestAnimationFrame(r));

  let dataUrl;
  try {
    dataUrl = await toPng(clone, { quality: 1.0, pixelRatio, cacheBust: true });
  } catch (err8) {
    console.warn('Export resolution fallback to 4x', err8);
    dataUrl = await toPng(clone, { quality: 1.0, pixelRatio: 4, cacheBust: true });
  }

  document.body.removeChild(wrapper);
  return dataUrl;
}

export async function exportScorecardAsPng({
  graphicEl,
  scorecardData,
  selectedGamePk,
  orientation,
  exportQuality,
  isMobile
}) {
  const quality = isMobile ? Math.min(exportQuality, 4) : exportQuality;
  const dataUrl = await captureGraphic(
    graphicEl,
    orientation,
    scorecardData?.gameInfo?.totalInnings,
    quality
  );
  if (!dataUrl) return;

  const away = scorecardData?.gameInfo?.awayTeam?.abbreviation || 'AWAY';
  const home = scorecardData?.gameInfo?.homeTeam?.abbreviation || 'HOME';
  const dateSlug = scorecardData?.gameInfo?.dateDisplay?.replace(/\s+/g, '-') || selectedGamePk;
  const filename = `MLB_Scorecard_${away}-vs-${home}_${dateSlug}.png`;

  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: 'image/png' });

  if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: filename,
      });
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
      return;
    } catch (shareErr) {
      if (shareErr.name === 'AbortError') return;
    }
  }

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = blobUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

  confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
}

export async function exportScorecardAsPdf({
  graphicEl,
  scorecardData,
  selectedGamePk,
  orientation,
  exportQuality,
  isMobile
}) {
  const isLandscape = orientation === 'landscape';
  const quality = isMobile ? Math.min(exportQuality, 4) : exportQuality;
  const dataUrl = await captureGraphic(
    graphicEl,
    orientation,
    scorecardData?.gameInfo?.totalInnings,
    quality
  );
  if (!dataUrl) return;

  const away = scorecardData?.gameInfo?.awayTeam?.abbreviation || 'AWAY';
  const home = scorecardData?.gameInfo?.homeTeam?.abbreviation || 'HOME';
  const dateSlug = scorecardData?.gameInfo?.dateDisplay?.replace(/\s+/g, '-') || selectedGamePk;

  const imgProps = new jsPDF().getImageProperties(dataUrl);
  const imgAspect = imgProps.width / imgProps.height;

  const pdfW = isLandscape ? 297 : 210;
  const pdfH = pdfW / imgAspect;

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [pdfW, pdfH]
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, pdfH);
  pdf.save(`MLB_Scorecard_${away}-vs-${home}_${dateSlug}.pdf`);
  confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
}

export function exportRawGameJson(rawGameData, scorecardData, selectedGamePk) {
  if (!rawGameData) return;
  const away = scorecardData?.gameInfo?.awayTeam?.abbreviation || 'AWAY';
  const home = scorecardData?.gameInfo?.homeTeam?.abbreviation || 'HOME';
  const dateSlug = scorecardData?.gameInfo?.dateDisplay?.replace(/\s+/g, '-') || selectedGamePk;
  const blob = new Blob([JSON.stringify(rawGameData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `MLB_GameFeed_${away}-vs-${home}_${dateSlug}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
