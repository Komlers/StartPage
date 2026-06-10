/* ============================================================
   Quick Links - 自定义快捷链接管理 (localStorage)
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'startpage_links';

  var defaultLinks = [
    { name: '哔哩哔哩', url: 'https://www.bilibili.com/', icon: 'icon/web/bilibili.svg' },
    { name: '微博', url: 'https://www.weibo.com/', icon: 'icon/web/weibo.svg' },
    { name: 'Steam', url: 'https://store.steampowered.com/', icon: 'icon/web/steam.svg' },
    { name: '必应翻译', url: 'https://www.bing.com/translator/', icon: 'icon/web/bing.svg' },
    { name: '知乎', url: 'https://www.zhihu.com/', icon: 'icon/web/zhihu.svg' },
    { name: '4399小游戏', url: 'https://www.4399.com/', icon: 'icon/web/4399.svg' },
    { name: 'Minecraft', url: 'https://www.minecraft.net/', icon: 'icon/web/minecraft.svg' },
    { name: '百度贴吧', url: 'https://tieba.baidu.com/', icon: 'icon/web/tieba.svg' },
    { name: '网易云音乐', url: 'https://music.163.com/', icon: 'icon/web/music163.svg' },
  ];

  function loadLinks() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {
      /* ignore */
    }
    return defaultLinks;
  }

  function saveLinks(links) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }

  function renderLinks(links) {
    var container = document.getElementById('quick-links');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var div = document.createElement('div');
      div.className = 'quick-link-item';
      div.innerHTML =
        '<button class="link-delete-btn" onclick="linkManager.delete(' +
        i +
        ')" title="删除">&times;</button>' +
        '<img src="' +
        link.icon +
        '" alt="' +
        link.name +
        '" loading="lazy" onerror="this.src=\'icon/res/link.svg\'" />' +
        '<br />' +
        '<a href="' +
        link.url +
        '" target="_blank">' +
        link.name +
        '</a>';
      container.appendChild(div);
    }
  }

  // Initialize links
  var currentLinks = loadLinks();
  renderLinks(currentLinks);

  // ==================== Link Edit Mode ====================

  var isEditing = false;

  function toggleEditMode() {
    isEditing = !isEditing;
    var items = document.querySelectorAll('.quick-link-item');
    var form = document.getElementById('link-add-form');

    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('editing', isEditing);
    }

    if (form) {
      form.classList.toggle('show', isEditing);
    }
  }

  function deleteLink(index) {
    var links = loadLinks();
    if (index < 0 || index >= links.length) return;
    links.splice(index, 1);
    saveLinks(links);
    renderLinks(links);
    if (isEditing) {
      var items = document.querySelectorAll('.quick-link-item');
      for (var i = 0; i < items.length; i++) {
        items[i].classList.add('editing');
      }
    }
  }

  function addLink(name, url, icon) {
    var links = loadLinks();
    links.push({ name: name, url: url, icon: icon || 'icon/res/link.svg' });
    saveLinks(links);
    renderLinks(links);
    if (isEditing) {
      var items = document.querySelectorAll('.quick-link-item');
      for (var i = 0; i < items.length; i++) {
        items[i].classList.add('editing');
      }
    }
  }

  function resetLinks() {
    if (confirm('确认恢复默认快捷链接？自定义的链接将被清除。')) {
      saveLinks(defaultLinks);
      renderLinks(defaultLinks);
      if (isEditing) {
        var items = document.querySelectorAll('.quick-link-item');
        for (var i = 0; i < items.length; i++) {
          items[i].classList.add('editing');
        }
      }
    }
  }

  function closeEdit() {
    if (isEditing) toggleEditMode();
  }

  // Close modal when clicking overlay background
  document.addEventListener('click', function (e) {
    if (e.target.id === 'link-add-form') {
      closeEdit();
    }
  });

  // Expose globally for inline onclick handlers
  window.linkManager = {
    toggleEdit: toggleEditMode,
    close: closeEdit,
    delete: deleteLink,
    add: addLink,
    reset: resetLinks,
  };

  // Handle add-link form submission
  window.submitNewLink = function () {
    var nameInput = document.getElementById('new-link-name');
    var urlInput = document.getElementById('new-link-url');
    var iconInput = document.getElementById('new-link-icon');

    var name = nameInput.value.trim();
    var url = urlInput.value.trim();

    if (!name || !url) {
      alert('请至少填写名称和网址！');
      return;
    }

    // Auto-add https:// if missing
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    var icon = iconInput.value.trim();
    // If no icon provided, use faviconsnap API to auto-fetch
    if (!icon) {
      icon = 'https://faviconsnap.com/api/favicon?url=' + encodeURIComponent(url);
    }

    // Test icon loading with 5000ms timeout, use default on failure
    var img = new Image();
    var timeoutId = setTimeout(function () {
      img.src = ''; // cancel loading
      addLink(name, url, 'icon/res/link.svg');
      iconInput.value = '';
      nameInput.value = '';
      urlInput.value = '';
    }, 5000);
    img.onload = function () {
      clearTimeout(timeoutId);
      addLink(name, url, icon);
      iconInput.value = '';
      nameInput.value = '';
      urlInput.value = '';
    };
    img.onerror = function () {
      clearTimeout(timeoutId);
      addLink(name, url, 'icon/res/link.svg');
      iconInput.value = '';
      nameInput.value = '';
      urlInput.value = '';
    };
    img.src = icon;
  };
})();
