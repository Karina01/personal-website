---
layout: layouts/base.njk
permalink: /contact/
title: Contact
templateEngineOverride: njk
description: Get in touch with Karina Brown.
---
<div class="page-head bleed">
  <div class="page-head__inner">
    <h1 class="page-head__title">Contact</h1>
  </div>
</div>

<div class="row section" data-reveal>
  <div class="row__full">
    <p class="contact-intro">I&rsquo;m open to work and to collaborating on projects. Get in touch if you&rsquo;d like to discuss what you&rsquo;re working on, what I&rsquo;m working on, or a gap you&rsquo;re trying to fill.</p>

    <div class="contact-actions">
      <a class="btn btn--primary" href="mailto:{{ site.email }}">Email me</a>
      <a class="btn btn--secondary" href="{{ site.linkedin }}" target="_blank" rel="noopener noreferrer">
        {{ site.linkedinLabel }}<span class="btn__ext" aria-hidden="true">&#8599;</span>
        <span class="visually-hidden">(opens in a new tab)</span>
      </a>
    </div>

    <p class="contact-address">{{ site.email }}</p>
  </div>
</div>
