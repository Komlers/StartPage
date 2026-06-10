/* ============================================================
   Dan_Evan's Start Page - Main Script
   Time, Date, Hitokoto & Search
   ============================================================ */

(function () {
  'use strict';

  // ==================== 1. Time & Date ====================

  function updateDateTime() {
    var now = new Date();
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var seconds = String(now.getSeconds()).padStart(2, '0');

    var timeEl = document.getElementById('time');
    var dateEl = document.getElementById('date');

    if (timeEl) timeEl.textContent = '当前时间：' + hours + ':' + minutes + ':' + seconds;
    if (dateEl) {
      var weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      var year = now.getFullYear();
      var month = now.getMonth() + 1;
      var day = now.getDate();
      var weekday = weekdays[now.getDay()];
      dateEl.textContent = year + '年' + month + '月' + day + '日 ' + weekday;
    }
  }

  setInterval(updateDateTime, 1000);
  updateDateTime();

  // ==================== 2. Hitokoto ====================

  async function fetchHitokoto() {
    try {
      var response = await fetch('https://v1.hitokoto.cn');
      var data = await response.json();
      var el = document.querySelector('#hitokoto_text');
      if (el) {
        el.href = 'https://hitokoto.cn/?uuid=' + data.uuid;
        el.textContent = data.hitokoto;
      }
    } catch (error) {
      console.error('一言获取失败:', error);
    }
  }
  fetchHitokoto();

  // ==================== 3. Search ====================

  window.search = function () {
    var engine = document.getElementById('searchSelect').value;
    var query = document.getElementById('searchInput').value;
    if (!query.trim()) {
      alert('请输入搜索关键字！');
      return;
    }
    window.open(engine + encodeURIComponent(query), '_blank');
  };

  window.handleEnter = function (event) {
    if (event.key === 'Enter') {
      var active = document.querySelector('.suggestion-item.active');
      if (active) {
        document.getElementById('searchInput').value = active.textContent;
        document.getElementById('searchSuggestions').classList.remove('active');
      }
      window.search();
    }
  };

  // ==================== 4. Search Suggestions ====================

  (function () {
    var input = document.getElementById('searchInput');
    var container = document.getElementById('searchSuggestions');
    var debounceTimer;

    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var query = this.value.trim();
      if (query.length < 2) {
        container.classList.remove('active');
        container.innerHTML = '';
        return;
      }
      debounceTimer = setTimeout(function () {
        fetchSuggestions(query);
      }, 200);
    });

    function fetchSuggestions(query) {
      var script = document.createElement('script');
      var cb = 'sd_' + Date.now();
      window[cb] = function (data) {
        var items = data.g ? data.g.map(function (x) { return x.q; }) : [];
        renderSuggestions(items);
        delete window[cb];
        document.body.removeChild(script);
      };
      script.src =
        'https://www.baidu.com/sugrec?prod=pc&wd=' +
        encodeURIComponent(query) +
        '&cb=' +
        cb;
      document.body.appendChild(script);
    }

    function renderSuggestions(items) {
      container.innerHTML = '';
      if (!items || items.length === 0) {
        container.classList.remove('active');
        return;
      }
      container.classList.add('active');
      for (var i = 0; i < items.length && i < 8; i++) {
        var div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = items[i];
        div.addEventListener('click', function () {
          input.value = this.textContent;
          container.classList.remove('active');
          window.search();
        });
        container.appendChild(div);
      }
    }

    input.addEventListener('blur', function () {
      setTimeout(function () {
        container.classList.remove('active');
      }, 200);
    });

    input.addEventListener('keydown', function (e) {
      var items = container.querySelectorAll('.suggestion-item');
      if (!items.length) return;
      var active = container.querySelector('.suggestion-item.active');
      var idx = -1;
      if (active) idx = Array.prototype.indexOf.call(items, active);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (active) active.classList.remove('active');
        var next = items[Math.min(idx + 1, items.length - 1)];
        next.classList.add('active');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (active) active.classList.remove('active');
        var prev = items[Math.max(idx - 1, 0)];
        prev.classList.add('active');
      }
    });

    // Close on Escape
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        container.classList.remove('active');
      }
    });
  })();

  // ==================== 5. Custom Tooltip for Header Icons ====================

  (function () {
    var tooltip = document.getElementById('tooltip');
    var links = document.querySelectorAll('.header-icons a');

    for (var i = 0; i < links.length; i++) {
      (function (link) {
        var img = link.querySelector('img');
        var text = img ? img.getAttribute('alt') : link.getAttribute('href');

        link.addEventListener('mouseenter', function () {
          tooltip.textContent = text;
          tooltip.classList.add('show');
        });

        link.addEventListener('mousemove', function (e) {
          tooltip.style.left = e.clientX + 'px';
          tooltip.style.top = e.clientY + 'px';
        });

        link.addEventListener('mouseleave', function () {
          tooltip.classList.remove('show');
        });
      })(links[i]);
    }
  })();

})();
