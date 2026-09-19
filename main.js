am5.ready(function() {
  // --- Idea list, FORMS, and amCharts logic ---
  let ideas = [];
  let ideaId = 1;

  function renderIdeaList() {
    const ul = document.getElementById('ideas-ul');
    ul.innerHTML = '';
    function renderIdeaNode(idea, level) {
      const li = document.createElement('li');
      li.style.marginLeft = (level * 28) + 'px';
      li.innerHTML = `<strong>${idea.id}.</strong> ${idea.text}`;
      // Critique form (nested for this idea)
      const form = document.createElement('form');
      form.style.marginTop = '6px';
      form.innerHTML = `
        <textarea rows="2" style="width:80%; resize: vertical" placeholder="Critique this idea..."></textarea>
        <button type="submit">Critique</button>
      `;
      const textarea = form.querySelector('textarea');
      textarea.addEventListener('keydown', function(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          form.requestSubmit();
        }
      });
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const val = textarea.value.trim();
        if (!val) return;
        idea.children.push({id: ideaId++, text: val, children: []});
        renderIdeaList();
      });
      li.appendChild(form);
      // Render children
      if (idea.children && idea.children.length > 0) {
        const childUl = document.createElement('ul');
        childUl.style.paddingLeft = '0.7em';
        idea.children.forEach(child => {
          childUl.appendChild(renderIdeaNode(child, level+1));
        });
        li.appendChild(childUl);
      }
      return li;
    }
    for (const idea of ideas) {
      ul.appendChild(renderIdeaNode(idea, 0));
    }
  }

  const rootForm = document.getElementById('root-idea-form');
  const rootTextarea = document.getElementById('user-text');
  rootTextarea.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      rootForm.requestSubmit();
    }
  });
  rootForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const ideaText = rootTextarea.value.trim();
    if (!ideaText) return;
    ideas.push({ id: ideaId++, text: ideaText, children: [] });
    rootTextarea.value = '';
    renderIdeaList();
  });

  renderIdeaList();

  // ---- amCharts 5 Collapsible Force-Directed Tree ----
  let amRoot;
  function renderAmChartsTree() {
    // Dispose existing root/chart if any (for hot reload, re-renders, etc)
    if (amRoot) {
      amRoot.dispose();  
    }
    /* Tea/Coffee wheel dataset (short version for demo; you can expand as desired) */
    const data = {
      name: "Flavor Wheel",
      children: [
        {
          name: "Floral",
          children: [
            { name: "Black Tea", value: 1 },
            { name: "Chamomile", value: 1 }
          ]
        },
        {
          name: "Fruity",
          children: [
            { name: "Berry", value: 1 },
            { name: "Dried Fruit", value: 1 },
            { name: "Citrus Fruit", value: 1 },
            { name: "Other Fruit", value: 1 }
          ]
        },
        {
          name: "Sour/Fermented",
          children: [
            { name: "Sour", value: 1 },
            { name: "Alcohol", value: 1 },
            { name: "Fermented", value: 1 }
          ]
        },
        {
          name: "Green/Vegetative",
          children: [
            { name: "Olive Oil", value: 1 },
            { name: "Raw", value: 1 },
            { name: "Peapod", value: 1 }
          ]
        },
        {
          name: "Roasted",
          children: [
            { name: "Pipe Tobacco", value: 1 },
            { name: "Brown Spice", value: 1 }
          ]
        },
        {
          name: "Spices",
          children: [
            { name: "Pepper", value: 1 },
            { name: "Pungent", value: 1 }
          ]
        },
        {
          name: "Nutty/Cocoa",
          children: [
            { name: "Nutty", value: 1 },
            { name: "Cocoa", value: 1 }
          ]
        },
        {
          name: "Sweet",
          children: [
            { name: "Brown Sugar", value: 1 },
            { name: "Vanilla", value: 1 }
          ]
        }
      ]
    };
    amRoot = am5.Root.new("chartdiv");
    amRoot.setThemes([
      am5.Theme.new(amRoot)
    ]);
    let container = amRoot.container.children.push(am5.Container.new(amRoot, {
      width: am5.p100,
      height: am5.p100,
      layout: am5.Layout.new(amRoot, {})
    }));
    let series = container.children.push(
      am5hierarchy.ForceDirected.new(amRoot, {
        singleBranchOnly: false,
        downDepth: 1, // show root + first level only, rest collapsed
        initialDepth: 1,
        valueField: "value",
        categoryField: "name",
        childDataField: "children",
        minRadius: 22,
        maxRadius: 45,
        manyBodyStrength: -15,  // moderate repulsion
        nodePadding: 12,
        centerStrength: 0.7,
        linkWithStrength: 0.85,
        draggable: true
      })
    );
    series.data.setAll([data]);
    // Colors: gradient across depth
    series.nodes.template.adapters.add("fill", function(fill, target) {
      let depth = target.dataItem.get("depth");
      const palette = [0x5677fc, 0x34c759, 0xff9500, 0xff2d55, 0x6f42c1, 0xffc107, 0x20bfa9, 0xff4081];
      let hex = palette[depth % palette.length] || 0xcccccc;
      return amRoot.interfaceColors.get("alternative").lighten(am5.color(hex), 0.5);
    });
    // Collapsible behavior
    series.nodes.template.setAll({
      toggleKey: "active",  // click to expand/collapse
      cursorOverStyle: "pointer",
      tooltipText: "{category}"
    });
    // Labels
    series.labels.template.setAll({
      fontSize: 14,
      text: "{category}"
    });
    // Animate initial appearance
    series.appear(1000, 100);  // fade/animation
  }
  renderAmChartsTree();
});
