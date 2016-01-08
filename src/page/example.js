(function($){
  function showCode(source, language) {
    $('#result-container').hide()
    $('#source-container')
      .show()
      .html('<pre><code></code></pre>')
      .find('code')
      .addClass('language-'+language)
      .html(escapeHtml(removeIndents(source)))
  }
  function showResult() {
    $('#result-container').show()
    $('#source-container').hide()
  }

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };
  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }
  function removeIndents(string) {
    var lines = string.split("\n");
    var min = 10;
    for (var i = 0; i<lines.length; i++){
      var line = lines[i];
      if (!line) continue;
      var match = line.match(/^(\s+)/)
      if (!match) return string;
      min = Math.min(min, match[1].length);
    }
    for (var i = 0; i<lines.length; i++){
      var line = lines[i];
      if (!line) continue;
      lines[i] = line.substring(min);
    }
    return lines.join("\n");
  }
  function showSource(sourceId, targetId) {
    var source = escapeHtml(removeIndents($(sourceId).html() || ""));
    $(targetId).html(source);
  }

  $(function(){
    showSource('#html-block', '#html-code');
    showSource('#script-block script', '#script-code');
    showSource('#style-block style', '#style-code');
  });

}(jQuery));