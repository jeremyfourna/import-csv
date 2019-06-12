function log(content) {
  console.log(...arguments);

  return content;
}

const mapIndexed = R.addIndex(R.map);

const el = document.getElementById('import-csv');
el.addEventListener('submit', event => {
  event.preventDefault();

  Papa.parse(event.target.elements['import-file'].files[0], {
    header: true,
    worker: true,
    complete: function(results) {
      log(results.data.length);
      const newCSV = R.compose(
        R.reduce((prev, cur) => {
          const list = [];
          R.forEachObjIndexed((value, key) => {
            if (key !== '') {
              mapIndexed((image, index) => {
                let newImage = '';
                if (prev.length === 0) {
                  newImage = R.assoc('abstract_sku', key, image);
                } else {
                  newImage = R.assoc('concrete_sku', key, image);
                }
                newImage = R.assoc('sort_order', index, newImage);
                list.push(newImage);
              }, value);
            }
          }, cur);
          return R.concat(prev, list);
        }, []),
        r => [R.groupBy(R.prop('abstract_sku'), r), R.groupBy(R.prop('concrete_sku'), r)],
        R.prop('data')
      )(results);

      render('result', Papa.unparse(newCSV, { quotes: true }));
    }
  });
});


// Write the migration analysis in the DOM
function render(selector, content) {
  document.getElementById(selector)
    .innerHTML = content;

  return selector;
}
