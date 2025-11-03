
export function formatNumber(num: number, decimals = 1) {
  if (typeof num !== 'number' || isNaN(num)) {
      return '0';
  }
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 1000000000) {
      // Billions
      return sign + (absNum / 1000000000).toFixed(decimals) + 'Bn';
  } else if (absNum >= 1000000) {
      // Millions
      return sign + (absNum / 1000000).toFixed(decimals) + 'Mn';
  } else if (absNum >= 1000) {
      // Thousands
      return sign + (absNum / 1000).toFixed(decimals) + 'K';
  } else {
      // Less than 1000
      return sign + absNum.toString();
  }
}
