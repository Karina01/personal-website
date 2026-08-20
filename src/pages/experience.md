---
layout: layouts/base.njk
templateEngineOverride: njk
permalink: /experience/
title: Experience
description: A brief story of Karina Brown's career to date.
organisations:
  - name: "McDonald's"
    logo: /images/mcdonalds.svg
    scale: 1.035
  - name: "Rolls-Royce"
    logo: /images/rolls-royce.svg
    scale: 1.037
  - name: "EY"
    logo: /images/ey.svg
    scale: 1.078
  - name: "EDF Energy"
    logo: /images/edf.svg
    scale: 0.993
  - name: "SSE"
    logo: /images/sse.svg
    scale: 1.0
  - name: "Avis Budget Group"
    logo: /images/avis-budget-group.svg
    scale: 0.712
    wide: true
  - name: "Irish Water (Uisce Éireann)"
  - name: "RBC Wealth Management"
  - name: "WTW"
    logo: /images/wtw.svg
    scale: 0.724
    wide: true
  - name: "Jaguar Land Rover"
    logo: /images/jaguar-land-rover.svg
    scale: 1.089
  - name: "Virgin Holidays"
    logo: /images/virgin.svg
    scale: 1.181
  - name: "Tate & Lyle"
    logo: /images/tate-lyle.svg
    scale: 0.62
    wide: true
  - name: "IKEA"
    logo: /images/ikea.svg
    scale: 0.659
  - name: "Wartsila"
    logo: /images/wartsila.svg
    scale: 1.143
  - name: "Ørsted"
    logo: /images/orsted.svg
    scale: 0.776
  - name: "PiC"
    logo: /images/pic.jpg
    scale: 0.854
  - name: "GroHappy"
    logo: /images/grohappy.png
    scale: 1.266
---
{#
  First argument is the date range shown in the margin column, second is the
  chapter heading. Everything between the tags is ordinary markdown.
#}

<div class="page-head bleed">
  <div class="page-head__inner">
    <h1 class="page-head__title">Experience</h1>
  </div>
</div>

{% chapter "2012 — 2016", "Learning the ropes" %}
I learned how large organisations work by advising them. I spent four years in **EY**'s energy practice, building strategies for UK energy retailers, designing operating models for large European organisations, and modelling investment cases. I learned how to solve problems in a structured way, how to run projects and how to communicate things clearly.

It was an excellent education in how big companies actually make decisions, but I found I craved being more hands-on, rather than handing over recommendations.
{% endchapter %}

{% chapter "2015 — 2021", "Building" %}
I joined the founding team at **PiC**, building an analytics product that helped organisations hire more diversely, and led the financial modelling that helped secure our investment round. I loved going from pitching in the morning to coding in the afternoon — really living the breadth of an early stage startup team.

I founded **GroHappy**, a B2B career development product used by leading professional services firms and fast-growth tech companies. We funded it through angel investment and consulting on the side, which was intense but allowed us to experiment as it grew.

At the **Institute of Clever Stuff**, I built analytics products with talented data scientists for our clients rather than for myself: one product designed to inform €100M+ investment decisions in retail, another launched to 4,000 engineers worldwide.

When moving to Copenhagen I wanted to work on the green transition, to have a more active role in addressing the climate crisis. I was offered a place on **Antler**'s green tech entrepreneur programme, but decided to join a company already driving the green transition.
{% endchapter %}

{% chapter "2021 — 2026", "Inside the green transition" %}
I took a course in energy system modelling at **DTU** and joined **Ørsted** (the world's leading offshore wind developer) a few weeks later. During nearly 5 years there I worked on strategy projects, led a team analysing emerging Power-to-X markets, and led an organisation-wide programme that identified 1bn DKK in savings. I built Ørsted's approach to forecasting future capability needs, and led the team driving Ørsted's transformation.

I had the chance to apply the analytical training, the operating-model work and the instinct for building in a company whose mission I believe in.
{% endchapter %}

{% chapter "2026 —", "Now" %}
In 2025 I became a parent for the first time and it unlocked a desire for greater creative freedom and control over my time. I left Ørsted in July 2026 and I'm using this year to work out what's next.

I'm writing a lot. I dream of writing a fantasy fiction book someday and I want to be a good writer in my 60s, so I'm practising now. I write a fortnightly newsletter reviewing cheese buns and am collaborating with a friend on a children's book. I find that writing helps me process my thoughts, form coherent opinions and articulate myself better.

I'm building things too. It's crazy how fast we can now go from idea to product with AI. Claude and I are spending a lot of time together. I am exploring a range of problems that bother or interest me, to see if there is a next business idea brewing — ranging from "how can we improve the quality of offshore wind incident data to make the sector safer?" to "how can we make it easier to understand and plan parental leave?".

I'm open to work and to collaborating on projects. If you'd like to discuss what you're working on, what I'm working on, or a gap you're trying to fill, then please [get in touch](/contact/).
{% endchapter %}

<section class="row section" data-reveal>
  <div class="row__main">
    <h2 class="meta orgs__label">Some of the organisations I have worked for</h2>
    <ul class="orgs">
      {% for org in organisations %}
        <li class="orgs__item{% if org.wide %} orgs__item--wide{% endif %}">
          {% if org.logo %}
            <img class="orgs__logo" src="{{ org.logo }}" alt="{{ org.name }}" style="--s: {{ org.scale }}" loading="lazy" decoding="async">
          {% else %}
            <span class="orgs__name">{{ org.name }}</span>
          {% endif %}
        </li>
      {% endfor %}
    </ul>
  </div>
</section>
