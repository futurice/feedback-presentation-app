self.addEventListener('message', function(e) {
  importScripts("http://localhost:5000/bower_components/underscore/underscore.js");
  var data = e.data;
  var avg_arr =  _.chain(data)
    .reduce(function(memo, val){ return memo.concat({topic: 'Overall', answer: val.value.npa_score}).concat(val.value.questions); }, [])
    .groupBy(function(val){ return val.topic; })
    .map(function(value, key){
      var avg = _.reduce(value, function(memo, ans) {return {i : (memo.i + 1), avg: (memo.avg * memo.i + ans.answer)/(memo.i+1)} }, {i: 0, avg: 0.0});
      return {topic: key, average: avg.avg.toFixed(1)}; })
    .value();
    self.postMessage(avg_arr);
}, false);
