---
permalink: /about/
title: About
templateEngineOverride: njk
description: Who Karina Brown is beyond work.
# Fill this in and the photograph appears. Sizes are the intrinsic pixel
# dimensions of the largest file, so the browser can reserve the space.
photo:
  # src: /images/karina.jpg
  # srcset: "/images/karina-480.jpg 480w, /images/karina-720.jpg 720w, /images/karina-1080.jpg 1080w"
  # width: 1080
  # height: 1350
  # alt: "TODO — describe the photograph"
---
<div class="row page-head">
  <div class="row__main">
    <h1 class="page-head__title">About</h1>
  </div>
</div>

<div class="row section" data-reveal>
  <div class="row__main prose">
    {% if photo.src %}
      <figure class="figure-break">
        <img
          src="{{ photo.src }}"
          {% if photo.srcset %}srcset="{{ photo.srcset }}" sizes="(max-width: 899px) 100vw, 400px"{% endif %}
          width="{{ photo.width }}"
          height="{{ photo.height }}"
          alt="{{ photo.alt }}"
        />
      </figure>
    {% endif %}

    <p>TODO — About copy. Runs alongside the photograph on desktop, beneath it on mobile.</p>
  </div>
</div>
