---
layout: layouts/base.njk
templateEngineOverride: njk
permalink: /current-projects/
title: Current projects
description: What Karina Brown is working on now.
---
<div class="page-head bleed">
  <div class="page-head__inner">
    <h1 class="page-head__title">Current projects</h1>
  </div>
</div>

{% for project in collections.projects %}
  <section class="row project" data-reveal>
    {% if project.data.image %}
      <div class="row__margin project__figure">
        <img
          src="{{ project.data.image.src }}"
          {% if project.data.image.srcset %}srcset="{{ project.data.image.srcset }}" sizes="140px"{% endif %}
          width="{{ project.data.image.width }}"
          height="{{ project.data.image.height }}"
          alt="{{ project.data.image.alt }}"
          loading="lazy"
          decoding="async"
        />
      </div>
    {% endif %}
    <div class="row__main prose">
      <h2 class="project__title">
        <a class="project__link" href="{{ project.url }}">{{ project.data.title }}</a>
      </h2>
      {{ project.templateContent | safe }}
    </div>
  </section>
{% endfor %}
