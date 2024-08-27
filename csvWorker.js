self.onmessage = function (e) {
  const { csvData } = e.data;

  try {
    // Check if csvData is provided
    if (!csvData || typeof csvData !== 'string') {
      throw new Error('Invalid CSV data.');
    }

    // Split CSV data into lines and filter out empty lines
    const lines = csvData
      .trim()
      .split('\n')
      .filter((line) => line.trim() !== '');
    if (lines.length < 2) {
      throw new Error('CSV data is too short.');
    }

    // Extract headers from the first line
    const headers = lines[0].split(',').map((header) => header.trim());

    // Process each subsequent line
    const data = lines
      .slice(1)
      .map((line) => {
        const values = line.split(',').map((value) => value.trim());
        let record = {};

        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });

        // Return record only if it has all required fields
        return record.Date &&
          record.Open &&
          record.High &&
          record.Low &&
          record.Close &&
          record.Volume
          ? record
          : null;
      })
      .filter((record) => record !== null); // Filter out invalid records

    // Send the processed data back to the main thread
    self.postMessage(data);
  } catch (error) {
    // Send error message back to the main thread
    self.postMessage({ error: error.message });
  }
};
