$(document).ready(function () {
  $('#fileInput').on('change', handleFileSelect);
  $('#expandAll').on('click', () => $('#treeView').jstree('open_all'));
  $('#collapseAll').on('click', () => $('#treeView').jstree('close_all'));

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const csvData = e.target.result;
      const worker = new Worker('csvWorker.js');
      worker.postMessage({ csvData });
      worker.onmessage = function (e) {
        const data = e.data;
        const groupedData = groupByMonthYear(data);
        $('#treeView').jstree({
          core: {
            data: transformDataToJsTreeFormat(groupedData),
          },
        });
      };
    };
    reader.readAsText(file);
  }

  function transformDataToJsTreeFormat(groupedData) {
    return Object.keys(groupedData).map((monthYear) => {
      return {
        text: monthYear,
        icon: 'jstree-folder',
        children: groupedData[monthYear].map((item) => ({
          text: `Date: ${item.Date} | Open: ${item.Open} | High: ${item.High} | Low: ${item.Low} | Close: ${item.Close} | Volume: ${item.Volume}`,
          icon: 'jstree-file',
        })),
      };
    });
  }

  function groupByMonthYear(data) {
    return data.reduce((acc, item) => {
      const [year, month] = item.Date.split('-').slice(0, 2);
      const monthYear = `${year}-${month}`;
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(item);
      return acc;
    }, {});
  }
});
