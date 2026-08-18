---
layout: layouts/base.njk
templateEngineOverride: njk
permalink: /experience/
title: Experience
description: A brief story of Karina Brown's career to date.
---
{#
  Four chapters, then a present-tense closing section.
  Copy is supplied by Karina — replace the TODOs below. Prose inside each
  {% chapter %} block is plain markdown: paragraphs, links, emphasis, lists.
  The first argument is the date range shown in the margin column, the second
  is the chapter heading. No numbered markers.
#}

<div class="row page-head">
  <div class="row__main">
    <h1 class="page-head__title">Experience</h1>
  </div>
</div>

{% chapter "TODO — date range", "TODO — chapter heading" %}
TODO — chapter one copy.
{% endchapter %}

{% chapter "TODO — date range", "TODO — chapter heading" %}
TODO — chapter two copy.
{% endchapter %}

{% chapter "TODO — date range", "TODO — chapter heading" %}
TODO — chapter three copy.
{% endchapter %}

{% chapter "TODO — date range", "TODO — chapter heading" %}
TODO — chapter four copy.
{% endchapter %}

{% chapter "Now", "TODO — closing heading" %}
TODO — present-tense closing copy.
{% endchapter %}
