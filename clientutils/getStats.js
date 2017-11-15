const arrayFromValues = (data) => {
  return data.map(x => parseFloat(JSON.parse(x.data).value));
};

const numericSort = (data) => {
  return data.sort((a,b) => a - b);
};

const sum = (data) => {
  return data.reduce((arr, x) => arr + x, 0);
};

const mean = (data) => {
  return sum(data) / data.length;
};

const median = (data) => {
  let sorted = numericSort(data);
  let mid = Math.floor(data.length / 2);
  if (data.length % 2 === 0) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
};

const std = (data) => {
  let avg = mean(data);
  return Math.sqrt(sum(data.map(x => Math.pow(x - avg, 2))));
};

const min = (data) => {
  return Math.min.apply(0, data);
};

const max = (data) => {
  return Math.max.apply(0, data);
};

export default (sink, latestData) => {
  const numericData = arrayFromValues(latestData);
  return {
    currentMean: mean(numericData),
    currentMedian: median(numericData),
    currentStd: std(numericData),
    currentMax: max(numericData),
    currentMin: min(numericData),
  };
};
