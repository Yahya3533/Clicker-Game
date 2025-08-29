
const SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

export const formatNumber = (value: number): string => {
  if (value < 1000) {
    return value.toFixed(1).replace(/\.0$/, '');
  }

  const tier = Math.floor(Math.log10(value) / 3);
  
  if (tier >= SUFFIXES.length) {
    return value.toExponential(2);
  }

  const suffix = SUFFIXES[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = value / scale;
  
  return scaled.toFixed(2) + suffix;
};
