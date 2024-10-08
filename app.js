$(document).ready(function () {
  $('#fileInput').on('change', handleFileSelect);
  $('#expandAll').on('click', () => $('#treeView').jstree('open_all'));
  $('#collapseAll').on('click', () => $('#treeView').jstree('close_all'));

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show loading animation
    $('#loading').show();

    // Use PapaParse to parse the CSV file
    Papa.parse(file, {
      header: true, // Treat the first row as headers
      skipEmptyLines: true, // Skip empty lines
      complete: function (results) {
        const data = results.data;
        const trends = calculateTrends(data);

        $('#treeView')
          .jstree({
            core: {
              data: transformDataToJsTreeFormat(trends),
            },
            plugins: ['wholerow'], // Optional: Better row styling
          })
          .on('loaded.jstree', function () {
            // Use a timeout to ensure the tree is fully rendered
            setTimeout(() => {
              // Find the last node
              const lastNode = $('#treeView').jstree(
                'get_node',
                $('#treeView').jstree('get_container').find('li').last()
              );

              if (lastNode) {
                // Expand the last node
                $('#treeView').jstree('open_node', lastNode);

                // Scroll to the last node
                const lastNodeElement = $('#' + lastNode.id);
                if (lastNodeElement.length) {
                  $('#treeView').scrollTop(
                    lastNodeElement.offset().top -
                      $('#treeView').offset().top +
                      $('#treeView').scrollTop()
                  );
                }
              }

              // Hide loading animation
              $('#loading').hide();
            }, 100); // Adjust the timeout as needed
          });
      },
      error: function (error) {
        console.error('Error parsing CSV file:', error);
        $('#loading').hide();
      },
    });
  }

  function transformDataToJsTreeFormat(trends) {
    return trends.map((trend) => ({
      text: `Trend: ${trend.type} | From: ${trend.fromDate} | To: ${trend.toDate}`,
      icon: 'jstree-file',
      li_attr: {
        class: trend.type === 'Up' ? 'uptrend' : 'downtrend',
      },
      children: trend.data.map((item) => ({
        text: `Date: ${item.Date} | Open: ${item.Open} | High: ${item.High} | Low: ${item.Low} | Close: ${item.Close} | Volume: ${item.Volume}`,
        icon: 'jstree-file',
      })),
    }));
  }

  function calculateTrends(data) {
    const trends = [];
    let currentTrend = null;

    for (let i = 0; i < data.length - 1; i++) {
      const item = data[i];
      const nextItem = data[i + 1];

      // Determine if we are in an uptrend or downtrend
      const isUpTrend = item.High < nextItem.High && item.Low < nextItem.Low;
      const isDownTrend = item.High > nextItem.High && item.Low > nextItem.Low;

      if (isUpTrend || isDownTrend) {
        if (currentTrend && currentTrend.type === (isUpTrend ? 'Up' : 'Down')) {
          // Continue current trend
          currentTrend.toDate = nextItem.Date;
          currentTrend.data.push(nextItem);
        } else {
          // Start new trend
          if (currentTrend) trends.push(currentTrend);
          currentTrend = {
            type: isUpTrend ? 'Up' : 'Down',
            fromDate: item.Date,
            toDate: nextItem.Date,
            data: [item, nextItem], // Initialize with the current and next item
          };
        }
      } else {
        if (currentTrend) {
          trends.push(currentTrend);
          currentTrend = null;
        }
      }
    }

    if (currentTrend) trends.push(currentTrend);

    // Sort trends by start date ascending and end date descending
    return trends.sort((a, b) => {
      const startDateA = new Date(a.fromDate);
      const startDateB = new Date(b.fromDate);
      const endDateA = new Date(a.toDate);
      const endDateB = new Date(b.toDate);

      // Ascending by start date
      if (startDateA < startDateB) return -1;
      if (startDateA > startDateB) return 1;

      // Descending by end date if start dates are equal
      if (endDateA > endDateB) return -1;
      if (endDateA < endDateB) return 1;

      return 0;
    });
  }
});
