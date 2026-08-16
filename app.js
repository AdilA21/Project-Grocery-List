(function () {
  "use strict";

  /* The storage key stays at grocery.v1 so live data is never orphaned. The
     shape inside it is versioned separately and upgraded by migrate(). */
  var KEY = "grocery.v1";

  /* ---------- seed ---------- */

  /* Everything holds the recurring items bought regardless of store, so it
     sits last, after the real shops. */
  var SEED_LISTS = [
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
    },
    {
      id: "staples",
      name: "Everything",
      items: [
        "Potatoes", "Salads", "Nuts", "Tomato", "Avocado", "Olive oil",
        "Fresh juice", "Chicken", "Cabbage", "Bread", "Eggs", "Fabuloso",
        "Air freshener", "Milk", "Heavy cream", "Garlic", "Fruits", "Vegetables"
      ]
    }
  ];

  /* Fallback icons, used when nobody has picked one for an item. Shared by
     every user, same as the picked ones. */
  var DEFAULT_ICONS = {
    "potato": "🥔", "salad": "🥗", "nut": "🥜",
    "tomato": "🍅", "avocado": "🥑", "olive oil": "🫒",
    "fresh juice": "🧃", "juice": "🧃", "chicken": "🍗",
    "cabbage": "🥬", "bread": "🍞", "egg": "🥚",
    "fabuloso": "🧴", "air freshener": "🌿", "milk": "🥛",
    "heavy cream": "🥛", "garlic": "🧄", "fruit": "🍎",
    "vegetable": "🥕", "snack": "🍿", "water": "💧",
    "pickle": "🥒", "cheese": "🧀", "pepper paste": "🌶️",
    "lemon": "🍋", "pecan or walnut": "🥜", "cocoa powder": "🍫",
    "tomato paste": "🥫", "eggplant": "🍆", "pepper": "🫑",
    "onion": "🧅", "salt": "🧂", "steak": "🥩",
    "black pepper": "🧂", "breakfast items": "🥐",
    "citric acid": "🍋", "onion powder": "🧅", "honey": "🍯",
    "pomegranate molasses": "🍯", "salmon": "🐟",
    "butter unsalted": "🧈", "butter": "🧈", "hand soap": "🧼",
    "soap": "🧼", "rice": "🍚", "pasta": "🍝",
    "coffee": "☕", "tea": "🍵", "sugar": "🍬",
    "flour": "🌾", "oil": "🫒", "beef": "🥩",
    "pork": "🥓", "bacon": "🥓", "fish": "🐟",
    "shrimp": "🦐", "apple": "🍎", "banana": "🍌",
    "orange": "🍊", "grape": "🍇", "strawberry": "🍓",
    "carrot": "🥕", "corn": "🌽", "mushroom": "🍄",
    "broccoli": "🥦", "cucumber": "🥒", "yogurt": "🥛",
    "ice cream": "🍦", "chocolate": "🍫", "cereal": "🥣",
    "toilet paper": "🧻", "paper towels": "🧻",
    "detergent": "🧴", "dish soap": "🧽", "trash bags": "🗑️",
    "batteries": "🔋", "napkins": "🧻"
  };

  var EMOJI = [
    {
      name: "Produce",
      list: ["🍎", "🍌", "🍇", "🍓",
             "🫐", "🍒", "🍑", "🥭",
             "🍍", "🥥", "🍋", "🍊",
             "🍐", "🥝", "🍉", "🥑",
             "🍅", "🥕", "🌽", "🥔",
             "🧅", "🧄", "🥬", "🥦",
             "🫑", "🌶️", "🍆", "🥒",
             "🫒", "🍄", "🥗"]
    },
    {
      name: "Bakery",
      list: ["🍞", "🥖", "🥐", "🥯",
             "🫓", "🧇", "🥞", "🍪",
             "🎂", "🧁", "🥧", "🌾"]
    },
    {
      name: "Dairy and eggs",
      list: ["🥛", "🧀", "🧈", "🥚",
             "🍦", "🥣"]
    },
    {
      name: "Meat and fish",
      list: ["🍗", "🥩", "🥓", "🍖",
             "🐟", "🍤", "🦐", "🦞",
             "🐙", "🍗"]
    },
    {
      name: "Pantry",
      list: ["🍚", "🍝", "🫘", "🥫",
             "🧂", "🍯", "🫙", "🧴",
             "🥜", "🌰", "🍫", "🍬",
             "☕", "🍵"]
    },
    {
      name: "Drinks",
      list: ["💧", "🧃", "🥤", "🧋",
             "🍶", "🍷", "🍺", "🧋"]
    },
    {
      name: "Snacks and frozen",
      list: ["🍿", "🍬", "🍩", "🍟",
             "🍕", "🌮", "🌯", "🥪",
             "🍔", "🍡"]
    },
    {
      name: "Household",
      list: ["🧻", "🧼", "🧽", "🧹",
             "🧺", "🪣", "🕯️", "🔋",
             "💡", "🗑️", "🧴", "🧷"]
    },
    {
      name: "Baby, pets, health",
      list: ["🍼", "🐕", "🐈", "🦴",
             "💊", "🪥", "🩹", "🧴"]
    },
    {
      name: "Other",
      list: ["📦", "🛒", "🎁", "📄",
             "🔧", "🌱", "💐", "⭐"]
    }
  ];

  function uid() {
    return "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function seed() {
    return {
      version: 2,
      activeUserId: "custom",
      settings: { sinkChecked: true },
      icons: {},
      users: [{
        id: "custom",
        name: "Custom",
        activeListId: "staples",
        lists: SEED_LISTS.map(function (l) {
          return {
            id: l.id,
            name: l.name,
            items: l.items.map(function (t) {
              return { id: uid(), text: t, checked: false };
            })
          };
        })
      }]
    };
  }

  /* ---------- migration ---------- */

  /* Version 1 kept one set of lists at the top level. Version 2 moves them
     under a user, so several people can keep their own stores, and adds the
     shared icon map. Returns null only when the data is unusable. */
  function migrate(d) {
    if (!d || typeof d !== "object") return null;

    if (!d.users) {
      if (!Array.isArray(d.lists) || !d.lists.length) return null;
      var lists = d.lists;
      generalize(lists);
      d = {
        version: 2,
        activeUserId: "custom",
        settings: d.settings || { sinkChecked: true },
        icons: {},
        users: [{
          id: "custom",
          name: "Custom",
          activeListId: d.activeListId || lists[0].id,
          lists: lists
        }]
      };
    }

    if (!Array.isArray(d.users) || !d.users.length) return null;
    if (!d.settings) d.settings = { sinkChecked: true };
    if (!d.icons || typeof d.icons !== "object") d.icons = {};
    d.version = 2;

    d.users.forEach(function (u) {
      if (!u.id) u.id = "u" + uid();
      if (!u.name) u.name = "Custom";
      if (!Array.isArray(u.lists)) u.lists = [];
      u.lists.forEach(function (l) {
        if (!Array.isArray(l.items)) l.items = [];
      });
      if (!byId(u.lists, u.activeListId)) {
        u.activeListId = u.lists.length ? u.lists[0].id : null;
      }
    });

    if (!byId(d.users, d.activeUserId)) d.activeUserId = d.users[0].id;
    return d;
  }

  /* Staples became a catch all for items from any store, so it takes a more
     general name and moves after the real shops. A name the owner already
     changed is left alone. */
  function generalize(lists) {
    var at = -1;
    lists.forEach(function (l, i) { if (l.id === "staples") at = i; });
    if (at < 0) return;
    var l = lists.splice(at, 1)[0];
    if (l.name === "Staples") l.name = "Everything";
    lists.push(l);
  }

  function byId(arr, id) {
    return arr.filter(function (x) { return x.id === id; })[0] || null;
  }

  /* ---------- state ---------- */

  var upgraded = false;
  var state = load();
  /* the app always opens on the picker, so a shared phone never lands in
     somebody else's list */
  var view = "home";
  var editing = false;
  var editingUsers = false;
  var combined = false;
  var justChecked = {};
  var undoSnapshot = null;
  var toastTimer = null;
  var pickingKey = null;

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return seed();
      var parsed = JSON.parse(raw);
      var d = migrate(parsed);
      if (!d) return seed();
      /* an upgraded shape is written back once the app is up, so storage does
         not sit on the old shape until the first edit. Unreadable data is
         left untouched, in case it can be recovered by hand. */
      upgraded = !parsed.users;
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

  function activeUser() {
    var u = byId(state.users, state.activeUserId);
    if (!u) { u = state.users[0]; state.activeUserId = u.id; }
    return u;
  }

  function activeList() {
    var u = activeUser();
    if (!u.lists.length) return null;
    var l = byId(u.lists, u.activeListId);
    if (!l) { l = u.lists[0]; u.activeListId = l.id; }
    return l;
  }

  function openCount(user) {
    var n = 0;
    user.lists.forEach(function (l) {
      l.items.forEach(function (i) { if (!i.checked) n++; });
    });
    return n;
  }

  /* ---------- icons ---------- */

  function iconKey(text) { return text.trim().toLowerCase(); }

  /* An explicit choice wins, including an explicit empty one. Otherwise fall
     back to the built in list. Plurals are tried both ways, because dropping
     one letter suits pickles and vegetables while dropping two suits
     potatoes and tomatoes. */
  function iconFor(text) {
    var k = iconKey(text);
    if (Object.prototype.hasOwnProperty.call(state.icons, k)) return state.icons[k];
    var tries = [k];
    if (/s$/.test(k)) tries.push(k.slice(0, -1));
    if (/es$/.test(k)) tries.push(k.slice(0, -2));
    for (var i = 0; i < tries.length; i++) {
      if (DEFAULT_ICONS[tries[i]]) return DEFAULT_ICONS[tries[i]];
    }
    return "";
  }

  function setIcon(key, glyph) {
    state.icons[key] = glyph;
    save();
    render();
  }

  /* ---------- elements ---------- */

  var el = {
    home: document.getElementById("home"),
    listView: document.getElementById("listView"),
    userSelect: document.getElementById("userSelect"),
    userList: document.getElementById("userList"),
    selAvatar: document.getElementById("selAvatar"),
    selName: document.getElementById("selName"),
    selSub: document.getElementById("selSub"),
    homeTally: document.getElementById("homeTally"),
    newUser: document.getElementById("newUser"),
    addUserBtn: document.getElementById("addUserBtn"),
    userEditBtn: document.getElementById("userEditBtn"),
    backBtn: document.getElementById("backBtn"),
    userName: document.getElementById("userName"),
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
    picker: document.getElementById("picker"),
    pickerFor: document.getElementById("pickerFor"),
    pickerGrid: document.getElementById("pickerGrid"),
    pickerClose: document.getElementById("pickerClose"),
    pickerClear: document.getElementById("pickerClear"),
    toast: document.getElementById("toast"),
    swNote: document.getElementById("swNote")
  };

  /* ---------- render ---------- */

  function render() {
    var list = view === "list" ? activeList() : null;
    document.body.classList.toggle("home-view", view === "home");
    document.body.classList.toggle("combined-view", view === "list" && combined);
    document.body.classList.toggle("no-store", view === "list" && !list);
    el.home.hidden = view !== "home";
    el.listView.hidden = view === "home";

    if (view === "home") { renderHome(); return; }
    if (combined) { renderCombined(); return; }
    renderList(list);
  }

  function initial(name) {
    return name.trim().slice(0, 1).toUpperCase() || "?";
  }

  function renderHome() {
    var current = activeUser();

    el.homeTally.textContent =
      state.users.length + (state.users.length === 1 ? " person" : " people");

    el.selAvatar.textContent = initial(current.name);
    el.selName.textContent = current.name;
    el.selSub.textContent = summary(current);

    el.userList.textContent = "";
    el.userList.className = "select-list" + (editingUsers ? " editing" : "");

    state.users.forEach(function (u) {
      var picked = u.id === state.activeUserId;
      var li = document.createElement("li");
      li.className = "opt" + (picked ? " on" : "");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", picked ? "true" : "false");

      var avatar = document.createElement("span");
      avatar.className = "avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = initial(u.name);
      li.appendChild(avatar);

      var label = document.createElement("span");
      label.className = "label";
      var name = document.createElement("span");
      name.textContent = u.name;
      label.appendChild(name);
      var sub = document.createElement("span");
      sub.className = "sub";
      sub.textContent = summary(u);
      label.appendChild(sub);
      label.addEventListener("click", function () {
        if (editingUsers) renameUser(u.id); else openUser(u.id);
      });
      li.appendChild(label);

      var tools = document.createElement("span");
      tools.className = "row-tools";
      tools.appendChild(mini("✎", "Rename " + u.name, function () {
        renameUser(u.id);
      }, false));
      var del = mini("✕", "Delete " + u.name, function () {
        deleteUser(u.id);
      }, false);
      del.className += " del";
      tools.appendChild(del);
      li.appendChild(tools);

      el.userList.appendChild(li);
    });
  }

  function setSelectOpen(on) {
    el.userList.hidden = !on;
    el.userSelect.setAttribute("aria-expanded", on ? "true" : "false");
  }

  function summary(user) {
    if (!user.lists.length) return "No stores yet";
    var stores = user.lists.length + (user.lists.length === 1 ? " store" : " stores");
    var left = openCount(user);
    return stores + ", " + (left ? left + " to get" : "all picked up");
  }

  function orderedItems(list) {
    if (!state.settings.sinkChecked) return list.items.slice();
    var open = [], done = [];
    list.items.forEach(function (i) { (i.checked ? done : open).push(i); });
    return open.concat(done);
  }

  function renderList(list) {
    el.userName.textContent = activeUser().name;
    el.empty.textContent = list
      ? "Nothing on this list yet. Add your first item below."
      : "No stores yet. Add one with the + store button above.";

    renderTabs(list);

    if (!list) {
      el.listName.textContent = "No stores yet";
      el.tally.textContent = "";
      el.tally.className = "tally";
      el.items.textContent = "";
      el.empty.hidden = false;
      return;
    }

    el.listName.textContent = list.name;

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

    el.items.textContent = "";
    el.items.className = "items" + (editing ? " editing" : "");
    var rows = orderedItems(list);
    el.empty.hidden = rows.length > 0;

    rows.forEach(function (item) {
      var realIndex = list.items.indexOf(item);
      var li = itemRow(item, function () { toggle(item.id); });

      var tools = document.createElement("span");
      tools.className = "row-tools";
      tools.appendChild(mini(iconFor(item.text) || "☺",
        "Choose an icon for " + item.text,
        function () { openPicker(item.text); }, false));
      tools.appendChild(mini("↑", "Move up", function () {
        move(realIndex, -1);
      }, realIndex === 0));
      tools.appendChild(mini("↓", "Move down", function () {
        move(realIndex, 1);
      }, realIndex === list.items.length - 1));
      var del = mini("✕", "Delete item", function () {
        removeItem(item.id);
      }, false);
      del.className += " del";
      tools.appendChild(del);
      li.appendChild(tools);

      if (editing) {
        li.querySelector(".label").addEventListener("click", function () {
          renameItem(item.id);
        });
      }
      el.items.appendChild(li);
    });
  }

  function renderTabs(list) {
    el.tabs.textContent = "";
    activeUser().lists.forEach(function (l) {
      var b = document.createElement("button");
      b.className = "tab";
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", list && l.id === list.id ? "true" : "false");
      b.textContent = l.name;
      var n = l.items.filter(function (i) { return !i.checked; }).length;
      if (n > 0) {
        var s = document.createElement("span");
        s.className = "n";
        s.textContent = n;
        b.appendChild(s);
      }
      b.addEventListener("click", function () {
        activeUser().activeListId = l.id;
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
  }

  /* one row, shared by the single store view and the whole trip view */
  function itemRow(item, onToggle) {
    var li = document.createElement("li");
    li.className = "row" + (item.checked ? " on" : "");

    var box = document.createElement("button");
    box.className = "box";
    box.type = "button";
    box.setAttribute("aria-label",
      item.checked ? "Mark as not picked up" : "Mark as picked up");
    box.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="4 12 10 18 20 6"/></svg>';
    box.addEventListener("click", onToggle);
    li.appendChild(box);

    /* the label already says what the item is, so the glyph is decorative
       and only takes up a slot when there is one */
    var glyph = iconFor(item.text);
    if (glyph) {
      var icon = document.createElement("span");
      icon.className = "icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = glyph;
      li.appendChild(icon);
    }

    var label = document.createElement("span");
    label.className = "label";
    label.textContent = item.text;
    label.addEventListener("click", onToggle);
    li.appendChild(label);

    return li;
  }

  function renderCombined() {
    el.userName.textContent = activeUser().name;
    el.listName.textContent = "Whole trip";
    el.empty.textContent = "Nothing left to get. Every list is picked up.";

    el.items.textContent = "";
    el.items.className = "items";

    var left = 0, stores = 0, shown = 0;

    activeUser().lists.forEach(function (l) {
      var open = l.items.filter(function (i) { return !i.checked; });
      /* keep rows checked off during this visit visible, so a tap does not
         make them vanish */
      var rows = l.items.filter(function (i) {
        return !i.checked || justChecked[i.id];
      });
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

      rows.forEach(function (item) {
        el.items.appendChild(itemRow(item, function () {
          toggleAnywhere(item.id);
        }));
      });
    });

    el.empty.hidden = shown > 0;

    if (left === 0) {
      el.tally.textContent = "All picked up";
      el.tally.className = "tally done";
    } else {
      el.tally.textContent = left + " to get across " + stores +
        (stores === 1 ? " store" : " stores");
      el.tally.className = "tally";
    }
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

  /* ---------- users ---------- */

  function openUser(id) {
    state.activeUserId = id;
    view = "list";
    setSelectOpen(false);
    setCombined(false);
    setEditing(false);
    save();
    render();
  }

  function addUser() {
    var name = el.newUser.value.trim();
    if (!name) { el.newUser.focus(); return; }
    var dupe = state.users.filter(function (u) {
      return u.name.toLowerCase() === name.toLowerCase();
    })[0];
    if (dupe) {
      el.newUser.value = "";
      toast(name + " is already here");
      return;
    }
    state.users.push({
      id: "u" + Date.now().toString(36),
      name: name,
      activeListId: null,
      lists: []
    });
    el.newUser.value = "";
    save();
    setSelectOpen(true);
    render();
    el.newUser.focus();
  }

  function renameUser(id) {
    var u = byId(state.users, id);
    if (!u) return;
    var v = prompt("Rename person", u.name);
    if (v === null) return;
    v = v.trim();
    if (!v) return;
    u.name = v;
    save();
    render();
  }

  function deleteUser(id) {
    if (state.users.length === 1) { toast("Keep at least one person"); return; }
    var u = byId(state.users, id);
    if (!u) return;
    if (!confirm("Delete " + u.name + " and their " + u.lists.length + " stores?")) return;
    snapshot();
    state.users = state.users.filter(function (x) { return x.id !== id; });
    if (!byId(state.users, state.activeUserId)) {
      state.activeUserId = state.users[0].id;
    }
    save();
    render();
    toast(u.name + " deleted", "Undo", restore);
  }

  /* ---------- items ---------- */

  function toggle(id) {
    var list = activeList();
    if (!list) return;
    list.items.forEach(function (i) { if (i.id === id) i.checked = !i.checked; });
    save();
    render();
  }

  function toggleAnywhere(id) {
    activeUser().lists.forEach(function (l) {
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

  function addItem() {
    var text = el.newItem.value.trim();
    if (!text) { el.newItem.focus(); return; }
    var list = activeList();
    if (!list) { toast("Add a store first"); return; }
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
    if (!list) return;
    list.items = list.items.filter(function (i) { return i.id !== id; });
    save();
    render();
  }

  function renameItem(id) {
    var list = activeList();
    if (!list) return;
    var item = byId(list.items, id);
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
    if (!list) return;
    var to = index + delta;
    if (to < 0 || to >= list.items.length) return;
    var moved = list.items.splice(index, 1)[0];
    list.items.splice(to, 0, moved);
    save();
    render();
  }

  function resetList() {
    var list = activeList();
    if (!list) return;
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
    activeUser().lists.forEach(function (l) {
      l.items.forEach(function (i) { i.checked = false; });
    });
    save();
    render();
    toast("Every list is fresh", "Undo", restore);
  }

  /* ---------- stores ---------- */

  function addStore() {
    var name = prompt("Store name");
    if (name === null) return;
    name = name.trim();
    if (!name) return;
    var id = "s" + Date.now().toString(36);
    var u = activeUser();
    u.lists.push({ id: id, name: name, items: [] });
    u.activeListId = id;
    setCombined(false);
    save();
    render();
    el.newItem.focus();
  }

  function renameStore() {
    var list = activeList();
    if (!list) return;
    var v = prompt("Rename store", list.name);
    if (v === null) return;
    v = v.trim();
    if (!v) return;
    list.name = v;
    save();
    render();
  }

  function deleteStore() {
    var u = activeUser();
    var list = activeList();
    if (!list) return;
    if (u.lists.length === 1) { toast("Keep at least one list"); return; }
    if (!confirm("Delete " + list.name + " and its " + list.items.length + " items?")) return;
    snapshot();
    u.lists = u.lists.filter(function (l) { return l.id !== list.id; });
    u.activeListId = u.lists[0].id;
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

  /* ---------- icon picker ---------- */

  function openPicker(text) {
    pickingKey = iconKey(text);
    el.pickerFor.textContent = "Icon for " + text;

    el.pickerGrid.textContent = "";
    EMOJI.forEach(function (group) {
      var h = document.createElement("div");
      h.className = "pick-group";
      h.textContent = group.name;
      el.pickerGrid.appendChild(h);

      var grid = document.createElement("div");
      grid.className = "pick-grid";
      group.list.forEach(function (glyph) {
        var b = document.createElement("button");
        b.className = "emo";
        b.type = "button";
        b.textContent = glyph;
        if (glyph === iconFor(text)) b.className += " on";
        b.addEventListener("click", function () {
          setIcon(pickingKey, glyph);
          closePicker();
        });
        grid.appendChild(b);
      });
      el.pickerGrid.appendChild(grid);
    });

    el.picker.hidden = false;
    el.scrim.hidden = false;
  }

  function closePicker() {
    pickingKey = null;
    el.picker.hidden = true;
    if (el.menu.hidden) el.scrim.hidden = true;
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
    var stamp = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
      "-" + String(d.getDate()).padStart(2, "0");
    a.href = url;
    a.download = "grocery-backup-" + stamp + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  /* Backups written before users existed still restore, through the same
     migration the app uses on load. */
  function importData(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var d = migrate(JSON.parse(reader.result));
        if (!d) throw new Error("bad shape");
        snapshot();
        state = d;
        view = "list";
        setCombined(false);
        setEditing(false);
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
    var noStore = !activeList();
    ["renameStore", "deleteStore"].forEach(function (act) {
      el.menu.querySelector("[data-act=\"" + act + "\"]").disabled = combined || noStore;
    });
    el.menu.hidden = false;
    el.scrim.hidden = false;
    el.menuBtn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    el.menu.hidden = true;
    if (el.picker.hidden) el.scrim.hidden = true;
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

  /* ---------- modes ---------- */

  function setEditing(on) {
    editing = on;
    el.editBtn.setAttribute("aria-pressed", editing ? "true" : "false");
    el.editBtn.textContent = editing ? "Done editing" : "Edit list";
  }

  function setEditingUsers(on) {
    editingUsers = on;
    el.userEditBtn.setAttribute("aria-pressed", editingUsers ? "true" : "false");
    el.userEditBtn.textContent = editingUsers ? "Done editing" : "Edit people";
  }

  function setCombined(on) {
    combined = on;
    justChecked = {};
    if (combined) setEditing(false);
    el.allBtn.setAttribute("aria-pressed", combined ? "true" : "false");
    el.allBtn.setAttribute("aria-label",
      combined ? "Show one store" : "Show every store");
  }

  /* ---------- wire up ---------- */

  el.addBtn.addEventListener("click", addItem);
  el.newItem.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); addItem(); }
  });

  el.addUserBtn.addEventListener("click", addUser);
  el.newUser.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); addUser(); }
  });

  el.backBtn.addEventListener("click", function () {
    view = "home";
    setEditingUsers(false);
    setSelectOpen(false);
    render();
  });

  el.userSelect.addEventListener("click", function () {
    setSelectOpen(el.userList.hidden);
  });

  /* editing is only visible with the list open, so open it */
  el.userEditBtn.addEventListener("click", function () {
    setEditingUsers(!editingUsers);
    if (editingUsers) setSelectOpen(true);
    render();
  });

  /* the edit button opens the list on the same click that bubbles up here,
     so it has to be exempt or it would close again straight away */
  document.addEventListener("click", function (e) {
    if (el.userList.hidden) return;
    if (e.target.closest(".select-wrap, #userEditBtn")) return;
    setSelectOpen(false);
  });

  el.resetBtn.addEventListener("click", resetList);

  el.editBtn.addEventListener("click", function () {
    setEditing(!editing);
    render();
  });

  el.allBtn.addEventListener("click", function () {
    setCombined(!combined);
    render();
  });

  el.menuBtn.addEventListener("click", function () {
    if (el.menu.hidden) openMenu(); else closeMenu();
  });
  el.scrim.addEventListener("click", function () { closeMenu(); closePicker(); });
  el.menu.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    closeMenu();
    var fn = ACTIONS[b.getAttribute("data-act")];
    if (fn) fn();
  });
  el.pickerClose.addEventListener("click", closePicker);
  el.pickerClear.addEventListener("click", function () {
    if (pickingKey === null) return;
    setIcon(pickingKey, "");
    closePicker();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!el.picker.hidden) closePicker();
    else if (!el.menu.hidden) closeMenu();
    else if (!el.userList.hidden) setSelectOpen(false);
  });

  el.fileInput.addEventListener("change", function () {
    if (el.fileInput.files && el.fileInput.files[0]) importData(el.fileInput.files[0]);
    el.fileInput.value = "";
  });

  setEditing(false);
  setEditingUsers(false);
  setCombined(false);
  render();
  if (upgraded) save();

  /* ---------- offline ---------- */

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function () {
        el.swNote.hidden = false;
      }).catch(function () {});
    });
  }
})();
