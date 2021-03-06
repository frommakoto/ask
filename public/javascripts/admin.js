var answer_json = null;
var current = 0;
var slowest = null;

function init() {
  var def = new $.Deferred();
  $.getJSON('/json/answer.json', function(data) {
    answer_json = data;
    def.resolve();
  });
  return def.promise();
}

function prev() {
  if(current <= 0) return;
  --current;
  updateInfo();
}

function next() {
  if(current >= answer_json.length - 1) return;
  ++current;
  updateInfo();
}

function updateInfo() {
  var c = answer_json[current];
  $('#period').text(c.period);
  $('#question').text(current);
  $('#title').text(c.title);
}

function changeState(action) {
  var c = answer_json[current];

  if(action == 'enable' || action == 'force') {
    socket.emit('start', { question: current, period: c.period, type: c.type, answer: c.answer, enable: action, slowest: slowest });
  }
  else if(action == 'result' || action == 'overall') {
    socket.emit('result', { question: current, period: c.period, answer: c.answer, type: c.type, order: c.order, result: action })
    next();
  }
  else if(action == 'reset') {
    $.ajax({
      url: '/api/resetDB'
    });
  }
}

$(document).ready(function() {
  init().then(next).then(hideLoader);
  socket.on('slowest', function(data) {
    slowest = data.slowest;
  });

  $('#prev').click(prev);
  $('#next').click(next);

  $('.control').click(function() {
    var $btn = $(this);
    if($btn.attr('id') == 'overall' && !window.confirm('最終結果みる?')) return;
    else if($btn.attr('id') == 'reset' && !window.confirm('DBの中身全部消す?'))　return;
    changeState($btn.attr('id'));
  });
});