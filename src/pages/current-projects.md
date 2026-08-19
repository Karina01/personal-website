---
permalink: /current-projects/
title: Current projects
description: What Karina Brown is working on now.
---
{% for project in collections.projects %}
  <div class="project">
    <h2 class="project__title">
      <a class="project__link" href="{{ project.url }}">{{ project.data.title }}</a>
    </h2>
    {{ project.templateContent | safe }}
  </div>
{% endfor %}
