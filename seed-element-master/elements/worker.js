self.addEventListener('message', function(e) {
  importScripts("https://feedback.futurice.com/bower_components/underscore/underscore.js");
  var data = e.data;
  var avg_arr =  _.chain(data)
    .reduce(function(memo, val){ return memo.concat({topic: 'Overall', answer: val.value.npa_score}).concat(val.value.questions); }, [])
    .groupBy(function(val){ return val.topic; })
    .map(function(value, key){
      var avg = _.reduce(value, function(memo, ans) {return [(memo[0] * memo[1] + ans.answer)/(memo[1]+1), (memo[1] + 1)] }, [0, 0]);
      return {topic: key, average: avg[0].toFixed(1)}; })
    .value();
    self.postMessage(avg_arr);
}, false);
