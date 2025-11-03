export function getBackgroundColor(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  // VIBGYOR hue buckets
  const vibgyorHues = [
    [0, 20],    // Red
    [20, 45],   // Orange
    [45, 65],   // Yellow
    [65, 170],  // Green
    [170, 250], // Blue
    [250, 275], // Indigo
    [275, 320], // Violet
    [340, 360], // Red wrap
  ];

  // Pick a bucket based on hash
  const bucketIndex = Math.abs(hash) % vibgyorHues.length;
  const [minHue, maxHue] = vibgyorHues[bucketIndex];

  // Spread hash inside bucket
  const hue = minHue + (Math.abs(hash) % (maxHue - minHue));

  // 70% transparency → alpha = 0.7
  return `hsla(${hue}, 70%, 55%, 0.5)`;
}
