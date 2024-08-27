self.onmessage = function (e) {
  const { csvData } = e.data;

  // Simple CSV parsing
  const lines = csvData.split('\n').filter((line) => line.trim() !== ''); // Filter out empty lines
  const headers = lines[0].split(',');
  const data = lines
    .slice(1)
    .map((line) => {
      const values = line.split(',');
      let record = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });
      return record;
    })
    .filter(
      (record) =>
        record.Date &&
        record.Open &&
        record.High &&
        record.Low &&
        record.Close &&
        record.Volume
    ); // Filter out invalid records

  self.postMessage(data);
};
