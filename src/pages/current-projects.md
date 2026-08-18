---
permalink: /current-projects/
title: Current projects
description: What Karina Brown is working on now.
lead: "TODO — one-sentence intro to what's underway."
---
<ul class="project-list">
  {% for project in collections.projects %}
    <li>
      <a class="project-list__link" href="{{ project.url }}">{{ project.data.title }}</a>
      {% if project.data.summary %}<p class="project-list__desc">{{ project.data.summary }}</p>{% endif %}
    </li>
  {% endfor %}
</ul>
