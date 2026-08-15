(function () {
  "use strict";

  var KEY = "grocery.v1";

  var SEED = {
    version: 1,
    activeListId: "staples",
    settings: { sinkChecked: true },
    lists: [
      {
        id: "staples",
        name: "Staples",
        items: [
          "Potatoes", "Salads", "Nuts", "Tomato", "Avocado", "Olive oil",
          "Fresh juice", "Chicken", "Cabbage", "Bread", "Eggs", "Fabuloso",
          "Air freshener", "Milk", "Heavy cream", "Garlic", "Fruits", "Vegetables"
        ]
      },
      {
        id: "costco",
        name: "Costco",
        items: ["Snacks", "Salads", "Water"]
      },
      {
        id: "lotte",
        name: "Lotte",
        items: [
          "Pickles", "Cheese", "Pepper paste", "Avocados", "Lemon", "Potato",
          "Pecan or walnut", "Cocoa powder", "Tomato paste", "Cabbage", "Eggplants",
          "Fruits", "Snacks", "Tomato", "Peppers", "Onions", "Salt", "Steak",
          "Black pepper", "Breakfast items", "Citric acid", "Onion powder", "Honey",
          "Pomegranate molasses", "Salmon", "Chicken", "Butter unsalted",
          "Heavy cream", "Milk", "Eggs", "Garlic"
        ]
      },
      {
        id: "walmart",
        name: "Walmart",
        items: ["Aizo food", "Bread", "Hand soap", "Cocoa powder"]
      },
      {
        id: "freshmarket",
        name: "Fresh Market",
        items: ["Juice", "Nuts", "Snacks"]
      }
    ]
  };

  function seed() {
    var d = JSON.parse(JSON.stringify(SEED));
    d.lists.forEach(function (l) {
      l.items = l.items.map(function (t) {
        return { id: uid(), text: t, checked: false };
      });
    });
    return d;
  }

  function uid() {
    return "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- state ---------- */

  var state = load();
  var editing = false;
  var combined = false;
  var justChecked = {};
  var undoSnapshot = null;
  var toastTimer = null;

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return seed();
      var d = JSON.parse(raw);
      if (!d || !Array.isArray(d.lists) || !d.lists.length) return seed();
      if (!d.settings) d.settings = { sinkChecked: true };
      return d;
    } catch (e) {
      return seed();
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      toast("Could not save. Storage may be full.");
    }
  }

  function activeList() {
    var l = state.lists.filter(function (x) { return x.id === state.activeListId; })[0];
    if (!l) { l = state.lists[0]; state.activeListId = l.id; }
    return l;
  }

  /* ---------- elements ---------- */

  var el = {
    listName: document.getElementById("listName"),
    tally: document.getElementById("tally"),
    tabs: document.getElementById("tabs"),
    items: document.getElementById("items"),
    empty: document.getElementById("empty"),
    newItem: document.getElementById("newItem"),
    addBtn: document.getElementById("addBtn"),
    resetBtn: document.getElementById("resetBtn"),
    editBtn: document.getElementById("editBtn"),
    menuBtn: document.getElementById("menuBtn"),
    allBtn: document.getElementById("allBtn"),
    menu: document.getElementById("menu"),
    scrim: document.getElementById("scrim"),
    sinkState: document.getElementById("sinkState"),
    fileInput: document.getElementById("fileInput"),
    toast: document.getElementById("toast"),
    swNote: document.getElementById("swNote")
  };

  /* ---------- render ---------- */

  function orderedItems(list) {
    if (!state.settings.sinkChecked) return list.items.slice();
    var open = [], done = [];
    list.items.forEach(function (i) { (i.checked ? done : open).push(i); });
    return open.concat(done);
  }

  function render() {
    document.body.classList.toggle("combined-view", combined);
    if (combined) { renderCombined(); return; }

    var list = activeList();

    el.listName.textContent = list.name;
    el.empty.textContent = "Nothing on this list yet. Add your first item below.";

    var left = list.items.filter(function (i) { return !i.checked; }).length;
    if (list.items.length === 0) {
      el.tally.textContent = "Empty list";
      el.tally.className = "tally";
    } else if (left === 0) {
      el.tally.textContent = "All picked up";
      el.tally.className = "tally done";
    } else {
      el.tally.textContent = left + " to get";
      el.tally.className = "tally";
    }

    /* tabs */
    el.tabs.textContent = "";
    state.lists.forEach(function (l) {
      var b = document.createElement("button");
      b.className = "tab";
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", l.id === list.id ? "true" : "false");
      b.textContent = l.name;
      var n = l.items.filter(function (i) { return !i.checked; }).length;
      if (n > 0) {
        var s = document.createElement("span");
        s.className = "n";
        s.textContent = n;
        b.appendChild(s);
      }
      b.addEventListener("click", function () {
        state.activeListId = l.id;
        save();
        render();
      });
      el.tabs.appendChild(b);
    });
    var addTab = document.createElement("button");
    addTab.className = "tab tab-add";
    addTab.type = "button";
    addTab.textContent = "+ store";
    addTab.addEventListener("click", addStore);
    el.tabs.appendChild(addTab);

    /* items */
    el.items.textContent = "";
    el.items.className = "items" + (editing ? " editing" : "");
    var rows = orderedItems(list);
    el.empty.hidden = rows.length > 0;

    rows.forEach(function (item) {
      var realIndex = list.items.indexOf(item);
      var li = document.createElement("li");
      li.className = "row" + (item.checked ? " on" : "");

      var box = document.createElement("button");
      box.className = "box";
      box.type = "button";
      box.setAttribute("aria-label", item.checked ? "Mark as not picked up" : "Mark as picked up");
      box.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="4 12 10 18 20 6"/></svg>';
      box.addEventListener("click", function () { toggle(item.id); });
      li.appendChild(box);

      var label = document.createElement("span");
      label.className = "label";
      label.textContent = item.text;
      if (editing) {
        label.addEventListener("click", function () { renameItem(item.id); });
      } else {
        label.addEventListener("click", function () { toggle(item.id); });
      }
      li.appendChild(label);

      var tools = document.createElement("span");
      tools.className = "row-tools";

      tools.appendChild(mini("\u2191", "Move up", function () { move(realIndex, -1); }, realIndex === 0));
      tools.appendChild(mini("\u2193", "Move down", function () { move(realIndex, 1); }, realIndex === list.items.length - 1));
      var del = mini("\u2715", "Delete item", function () { removeItem(item.id); }, false);
      del.className += " del";
      tools.appendChild(del);

      li.appendChild(tools);
      el.items.appendChild(li);
    });
  }

  function renderCombined() {
    el.listName.textContent = "Whole trip";
    el.empty.textContent = "Nothing left to get. Every list is picked up.";

    el.items.textContent = "";
    el.items.className = "items";

    var left = 0, stores = 0, shown = 0;

    state.lists.forEach(function (l) {
      var open = l.items.filter(function (i) { return !i.checked; });
      /* keep rows checked off during this visit visible, so a tap does not make them vanish */
      var rows = l.items.filter(function (i) { return !i.checked || justChecked[i.id]; });
      if (open.length) { left += open.length; stores++; }
      if (!rows.length) return;
      shown += rows.length;

      var head = document.createElement("li");
      head.className = "group";
      var name = document.createElement("span");
      name.textContent = l.name;
      head.appendChild(name);
      var count = document.createElement("span");
      count.className = "n";
      count.textContent = open.length;
      head.appendChild(count);
      el.items.appendChild(head);

      rows.forEach(function (item) { el.items.appendChild(combinedRow(item)); });
    });

    el.empty.hidden = shown > 0;

    if (left === 0) {
      el.tally.textContent = "All picked up";
      el.tally.className = "tally done";
    } else {
      el.tally.textContent = left + " to get across " + stores + (stores === 1 ? " store" : " stores");
      el.tally.className = "tally";
    }
  }

  function combinedRow(item) {
    var li = document.createElement("li");
    li.className = "row" + (item.checked ? " on" : "");

    var box = document.createElement("button");
    box.className = "box";
    box.type = "button";
    box.setAttribute("aria-label", item.checked ? "Mark as not picked up" : "Mark as picked up");
    box.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="4 12 10 18 20 6"/></svg>';
    box.addEventListener("click", function () { toggleAnywhere(item.id); });
    li.appendChild(box);

    var label = document.createElement("span");
    label.className = "label";
    label.textContent = item.text;
    label.addEventListener("click", function () { toggleAnywhere(item.id); });
    li.appendChild(label);

    return li;
  }

  function setCombined(on) {
    combined = on;
    justChecked = {};
    if (combined) setEditing(false);
    el.allBtn.setAttribute("aria-pressed", combined ? "true" : "false");
    el.allBtn.setAttribute("aria-label", combined ? "Show one store" : "Show every store");
  }

  function toggleAnywhere(id) {
    state.lists.forEach(function (l) {
      l.items.forEach(function (i) {
        if (i.id !== id) return;
        i.checked = !i.checked;
        if (i.checked) justChecked[i.id] = true;
        else delete justChecked[i.id];
      });
    });
    save();
    render();
  }

  function mini(glyph, label, fn, disabled) {
    var b = document.createElement("button");
    b.className = "mini";
    b.type = "button";
    b.textContent = glyph;
    b.setAttribute("aria-label", label);
    if (disabled) { b.disabled = true; b.style.opacity = "0.25"; }
    else { b.addEventListener("click", fn); }
    return b;
  }

  /* ---------- actions ---------- */

  function toggle(id) {
    var list = activeList();
    list.items.forEach(function (i) { if (i.id === id) i.checked = !i.checked; });
    save();
    render();
  }

  function addItem() {
    var text = el.newItem.value.trim();
    if (!text) { el.newItem.focus(); return; }
    var list = activeList();
    var dupe = list.items.filter(function (i) {
      return i.text.toLowerCase() === text.toLowerCase();
    })[0];
    if (dupe) {
      dupe.checked = false;
      toast(text + " is already on this list");
    } else {
      list.items.push({ id: uid(), text: text, checked: false });
    }
    el.newItem.value = "";
    save();
    render();
    el.newItem.focus();
  }

  function removeItem(id) {
    var list = activeList();
    list.items = list.items.filter(function (i) { return i.id !== id; });
    save();
    render();
  }

  function renameItem(id) {
    var list = activeList();
    var item = list.items.filter(function (i) { return i.id === id; })[0];
    if (!item) return;
    var v = prompt("Rename item", item.text);
    if (v === null) return;
    v = v.trim();
    if (!v) return;
    item.text = v;
    save();
    render();
  }

  function move(index, delta) {
    var list = activeList();
    var to = index + delta;
    if (to < 0 || to >= list.items.length) return;
    var moved = list.items.splice(index, 1)[0];
    list.items.splice(to, 0, moved);
    save();
    render();
  }

  function resetList() {
    var list = activeList();
    var any = list.items.some(function (i) { return i.checked; });
    if (!any) { toast("Nothing is checked off"); return; }
    snapshot();
    list.items.forEach(function (i) { i.checked = false; });
    save();
    render();
    toast("Fresh list for " + list.name, "Undo", restore);
  }

  function resetAll() {
    snapshot();
    state.lists.forEach(function (l) {
      l.items.forEach(function (i) { i.checked = false; });
    });
    save();
    render();
    toast("Every list is fresh", "Undo", restore);
  }

  function addStore() {
    var name = prompt("Store name");
    if (name === null) return;
    name = name.trim();
    if (!name) return;
    var id = "s" + Date.now().toString(36);
    state.lists.push({ id: id, name: name, items: [] });
    state.activeListId = id;
    setCombined(false);
    save();
    render();
    el.newItem.focus();
  }

  function renameStore() {
    var list = activeList();
    var v = prompt("Rename store", list.name);
    if (v === null) return;
    v = v.trim();
    if (!v) return;
    list.name = v;
    save();
    render();
  }

  function deleteStore() {
    if (state.lists.length === 1) { toast("Keep at least one list"); return; }
    var list = activeList();
    if (!confirm("Delete " + list.name + " and its " + list.items.length + " items?")) return;
    snapshot();
    state.lists = state.lists.filter(function (l) { return l.id !== list.id; });
    state.activeListId = state.lists[0].id;
    save();
    render();
    toast(list.name + " deleted", "Undo", restore);
  }

  function toggleSink() {
    state.settings.sinkChecked = !state.settings.sinkChecked;
    el.sinkState.textContent = state.settings.sinkChecked ? "On" : "Off";
    save();
    render();
  }

  /* ---------- undo ---------- */

  function snapshot() { undoSnapshot = JSON.stringify(state); }

  function restore() {
    if (!undoSnapshot) return;
    state = JSON.parse(undoSnapshot);
    undoSnapshot = null;
    save();
    render();
    hideToast();
  }

  /* ---------- backup ---------- */

  function exportData() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var d = new Date();
    var stamp = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    a.href = url;
    a.download = "grocery-backup-" + stamp + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function importData(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var d = JSON.parse(reader.result);
        if (!d || !Array.isArray(d.lists)) throw new Error("bad shape");
        snapshot();
        state = d;
        if (!state.settings) state.settings = { sinkChecked: true };
        save();
        render();
        toast("Backup restored", "Undo", restore);
      } catch (e) {
        toast("That file is not a grocery backup");
      }
    };
    reader.onerror = function () { toast("Could not read that file"); };
    reader.readAsText(file);
  }

  /* ---------- menu ---------- */

  function openMenu() {
    el.sinkState.textContent = state.settings.sinkChecked ? "On" : "Off";
    /* both act on the store behind the combined view, which is off screen */
    ["renameStore", "deleteStore"].forEach(function (act) {
      el.menu.querySelector("[data-act=\"" + act + "\"]").disabled = combined;
    });
    el.menu.hidden = false;
    el.scrim.hidden = false;
    el.menuBtn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    el.menu.hidden = true;
    el.scrim.hidden = true;
    el.menuBtn.setAttribute("aria-expanded", "false");
  }

  var ACTIONS = {
    addStore: addStore,
    renameStore: renameStore,
    deleteStore: deleteStore,
    resetAll: resetAll,
    toggleSink: toggleSink,
    export: exportData,
    import: function () { el.fileInput.click(); },
    close: function () {}
  };

  /* ---------- toast ---------- */

  function toast(msg, actionLabel, actionFn) {
    clearTimeout(toastTimer);
    el.toast.textContent = "";
    var span = document.createElement("span");
    span.textContent = msg;
    el.toast.appendChild(span);
    if (actionLabel) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = actionLabel;
      b.addEventListener("click", actionFn);
      el.toast.appendChild(b);
    }
    el.toast.hidden = false;
    toastTimer = setTimeout(hideToast, actionLabel ? 6000 : 2600);
  }

  function hideToast() { el.toast.hidden = true; }

  /* ---------- wire up ---------- */

  el.addBtn.addEventListener("click", addItem);
  el.newItem.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); addItem(); }
  });

  el.resetBtn.addEventListener("click", resetList);

  el.editBtn.addEventListener("click", function () {
    setEditing(!editing);
    render();
  });

  function setEditing(on) {
    editing = on;
    el.editBtn.setAttribute("aria-pressed", editing ? "true" : "false");
    el.editBtn.textContent = editing ? "Done editing" : "Edit list";
  }

  el.allBtn.addEventListener("click", function () {
    setCombined(!combined);
    render();
  });

  el.menuBtn.addEventListener("click", function () {
    if (el.menu.hidden) openMenu(); else closeMenu();
  });
  el.scrim.addEventListener("click", closeMenu);
  el.menu.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    closeMenu();
    var fn = ACTIONS[b.getAttribute("data-act")];
    if (fn) fn();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !el.menu.hidden) closeMenu();
  });

  el.fileInput.addEventListener("change", function () {
    if (el.fileInput.files && el.fileInput.files[0]) importData(el.fileInput.files[0]);
    el.fileInput.value = "";
  });

  render();

  /* ---------- offline ---------- */

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function () {
        el.swNote.hidden = false;
      }).catch(function () {});
    });
  }
})();
