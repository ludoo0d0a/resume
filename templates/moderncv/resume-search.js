/** Inlined in generated HTML — filters resume blocks via ResumeFuzzy. */
export default `(function () {
  var input = document.getElementById('resume-search');
  var fuzzy = window.ResumeFuzzy;
  if (!input || !fuzzy) return;

  var status = document.getElementById('resume-search-status');
  var emptyMsg = input.getAttribute('data-empty-msg') || '';
  var matchMsg = input.getAttribute('data-match-msg') || '';
  var units = Array.prototype.slice.call(
    document.querySelectorAll(
      [
        '.hero__about',
        '.timeline-flow__item',
        '.skill-card',
        '.card-list__item',
        '.lang-list__item',
        '.interest-list__item',
        '.ref-card',
      ].join(', '),
    ),
  );
  var sections = Array.prototype.slice.call(document.querySelectorAll('.content .section, .hero__about'));
  var timer;

  function clearHighlights(root) {
    var marks = root.querySelectorAll('mark.search-highlight');
    for (var i = marks.length - 1; i >= 0; i -= 1) {
      var mark = marks[i];
      var parent = mark.parentNode;
      if (!parent) continue;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
      parent.normalize();
    }
  }

  function acceptTextNode(node) {
    var parent = node.parentElement;
    if (!parent || !node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
    if (parent.closest('script, style, mark.search-highlight, .toolbar__search')) {
      return NodeFilter.FILTER_REJECT;
    }
    return NodeFilter.FILTER_ACCEPT;
  }

  function collectTextNodes(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, acceptTextNode);
    var nodes = [];
    var offset = 0;
    while (walker.nextNode()) {
      var len = walker.currentNode.nodeValue.length;
      nodes.push({ node: walker.currentNode, start: offset, end: offset + len });
      offset += len;
    }
    return nodes;
  }

  function mergeLocalSpans(ranges) {
    if (!ranges.length) return [];
    var sorted = ranges.slice().sort(function (a, b) {
      return a.start - b.start;
    });
    var out = [sorted[0]];
    for (var i = 1; i < sorted.length; i += 1) {
      var last = out[out.length - 1];
      var cur = sorted[i];
      if (cur.start <= last.end) {
        last.end = Math.max(last.end, cur.end);
      } else {
        out.push(cur);
      }
    }
    return out;
  }

  function highlightSpans(root, spans) {
    if (!spans.length) return;
    collectTextNodes(root).forEach(function (entry) {
      var local = [];
      spans.forEach(function (span) {
        if (span.end <= entry.start || span.start >= entry.end) return;
        local.push({
          start: Math.max(0, span.start - entry.start),
          end: Math.min(entry.end - entry.start, span.end - entry.start),
        });
      });
      if (!local.length) return;
      var text = entry.node.nodeValue;
      var ranges = mergeLocalSpans(local);
      var frag = document.createDocumentFragment();
      var last = 0;
      ranges.forEach(function (range) {
        if (range.start > last) frag.appendChild(document.createTextNode(text.slice(last, range.start)));
        var mark = document.createElement('mark');
        mark.className = 'search-highlight';
        mark.textContent = text.slice(range.start, range.end);
        frag.appendChild(mark);
        last = range.end;
      });
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      entry.node.parentNode.replaceChild(frag, entry.node);
    });
  }

  function highlightUnit(root, rawQuery) {
    var spans = fuzzy.findHighlightSpans(root.textContent, rawQuery);
    if (!spans.length) return;
    highlightSpans(root, spans);
  }

  function setStatus(query, visible) {
    if (!status) return;
    if (!query) {
      status.hidden = true;
      status.textContent = '';
      return;
    }
    status.hidden = false;
    status.textContent = visible
      ? matchMsg.replace('{n}', String(visible))
      : emptyMsg;
  }

  function apply() {
    var query = fuzzy.normalize(input.value.trim());
    var visible = 0;

    units.forEach(function (el) {
      clearHighlights(el);
    });

    units.forEach(function (el) {
      var hit = !query || fuzzy.matches(query, el.textContent);
      el.classList.toggle('is-search-hidden', !hit);
      el.classList.toggle('is-search-match', Boolean(query && hit));
      if (hit) {
        visible += 1;
        if (query) highlightUnit(el, input.value.trim());
      }
    });

    sections.forEach(function (section) {
      if (section.classList.contains('hero__about')) return;
      var hasVisible = Array.prototype.some.call(
        section.querySelectorAll(
          '.timeline-flow__item, .skill-card, .card-list__item, .lang-list__item, .interest-list__item, .ref-card',
        ),
        function (el) {
          return !el.classList.contains('is-search-hidden');
        },
      );
      section.classList.toggle('is-search-hidden', Boolean(query && !hasVisible));
    });

    document.querySelectorAll('.timeline-flow__year').forEach(function (year) {
      var next = year.nextElementSibling;
      var any = false;
      while (next && !next.classList.contains('timeline-flow__year')) {
        if (next.classList.contains('timeline-flow__item') && !next.classList.contains('is-search-hidden')) {
          any = true;
          break;
        }
        next = next.nextElementSibling;
      }
      year.classList.toggle('is-search-hidden', Boolean(query && !any));
    });

    setStatus(query, visible);
  }

  input.addEventListener('input', function () {
    window.clearTimeout(timer);
    timer = window.setTimeout(apply, 120);
  });
  input.addEventListener('search', apply);
})();`;
