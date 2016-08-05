var SpriteSpinPage = SpriteSpinPage || {}; 
(function($, page){
  'use strict';

  if (Prism.plugins.NormalizeWhitespace) {
    Prism.plugins.NormalizeWhitespace.setDefaults({
      'remove-trailing': true,
      'remove-indent': true,
      'left-trim': true,
      'right-trim': true,
      //'break-lines': 80,
      //'indent': 2,
      //'remove-initial-line-feed': true,
      //'tabs-to-spaces': 4,
      //'spaces-to-tabs': 4
    });
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
  function fixIndents(string) {
    var lines = string.split("\n");
    if (!lines.length) return string;
    if (lines[0].trim().startsWith('<script') ||
        lines[0].trim().startsWith('<style')) {
      lines[0] = '        ' + lines[0];
      return lines.join('\n');
    }
    return string;
  }

  function makeSnippet(html, language) {
    var preEl = $('<pre>').addClass('language-' + language).addClass('line-numbers');
    var codeEl = $('<code>').appendTo(preEl).text(fixIndents(html));
    Prism.highlightElement(codeEl[0]);
    return preEl;
  }

  function getItem(key) {
    if (window.localStorage) {
      return window.localStorage.getItem(key)
    }
  }
  function setItem(key, value) {
    if (window.localStorage) {
      window.localStorage.setItem(key, value)
    }
  }

  page.bootSample = function(options) {
    var view = $(options.view);
    var code = $(options.code);
    var source = $(options.source);

    var tabs = [];
    function currentTab() {
      var tab = tabs[tabs.length-1] || { 
        name: 'Example', 
        content: $('<div>').addClass('tab-content') 
      };
      tabs[tabs.length-1] = tab;
      return tab;
    }
    source.children().each(function() {
      var $this = $(this);
      if ($this.is('a[name]')) {
        tabs.push({
          name: $this.attr('name'),
          index: Number($this.attr('index'))|0,
          content: $('<div>').addClass('tab-content')
        });
      } else if ($this.is('viewcode')) {
        makeSnippet(view[0].innerHTML, 'html').appendTo(currentTab().content);
      } else if ($this.is('script') || $this.is('style')) {
        makeSnippet($this[0].outerHTML, 'html').appendTo(currentTab().content);
      } else if ($this.is('[example]')) {
        $this.detach().appendTo(currentTab().content);
        makeSnippet($this.html(), 'html').appendTo(currentTab().content);
      } else {
        $this.detach().appendTo(currentTab().content);
      }
    });

    var tabsEl = $('<div>').addClass('sample-tabs').appendTo(code);
    var contentsEl = $('<div>').addClass('sample-contents').appendTo(code);

    tabs.sort(function(a, b) {
      return a.index - b.index;
    }).forEach(function(tab) {
      var tabEl = $('<a>').text(tab.name).attr('tab', tab.name).appendTo(tabsEl);
      var contentEl = tab.content.appendTo(contentsEl);
      tabEl.click(function() {
        setItem('recentTab', tab.name);
        contentsEl.children().hide();
        contentEl.show();
        tabsEl.children().removeClass('active');
        tabEl.addClass('active');
      });
    });

    tabsEl.find('[tab]').first().click();
    //var recent = getItem('recentTab');
    //var found = tabsEl.find('[tab="' + recent + '"]');
    //if (recent && found.length) {
    //  found.click();
    //} else {
    //  tabsEl.find('[tab]').first().click();
    //}
  };

  //
  // Sample Menu
  //

  page.samplePrefix = '/examples/';
  page.sampleLinks = [];
  page.sampleIframe = null;
  page.sampleTitle = null;
  page.onHashChanged = function() {
    var hash = location.hash;
    if (!hash) return;
    var link = page
      .sampleLinks
      .removeClass('active')
      .filter('[href="' + hash + '"]')
      .addClass('active');
    page
      .sampleIframe
      .fadeTo(200, 0, function() {
        $(this)
          .attr('src', hash.replace('#', page.samplePrefix))
          .delay(300)
          .fadeTo(200, 1);
      });
    page.sampleTitle
      .fadeTo(200, 0, function() {
        $(this)
          .text(link.attr('title') || link.text())
          .delay(300)
          .fadeTo(200, 1);
      });
  };
  page.openFirstSample = function() {
    location.hash = page.sampleLinks.first().attr('href')
  };
  page.openNextSample = function() {
    var links = page.sampleLinks;
    var link = links.filter('.active').first()
    if (!link.length) {
      page.openFirstSample();
      return;
    }

    link = $(links[links.index(link) + 1])
    if (!link.length) {
      page.openFirstSample();
      return;
    }
    location.hash = link.attr('href');
  };
  page.openPrevSample = function() {
    var links = page.sampleLinks;
    var link = links.filter('.active').first()
    if (!link.length) {
      page.openFirstSample();
      return;
    }

    link = $(links[links.index(link) - 1])
    if (!link.length) {
      page.openFirstSample();
      return;
    }
    location.hash = link.attr('href');
  };
  page.bootSampleMenu = function(options) {
    page.samplePrefix = options.prefix;
    page.sampleLinks = $(options.links);
    page.sampleIframe = $(options.iframe);
    page.sampleTitle = $(options.title);
    window.addEventListener("hashchange", page.onHashChanged, false);
    if (location.hash) {
      page.onHashChanged();
    } else {
      page.openFirstSample();
    }
  }
}(jQuery, SpriteSpinPage));
