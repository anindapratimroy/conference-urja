import re

with open("index.html", "r") as f:
    content = f.read()

# 1. Remove navbar items
content = re.sub(r'<li><button class="nav-link" data-section="soc"\s+id="nav-soc">SOC</button></li>\n', '', content)
content = re.sub(r'<li><button class="nav-link" data-section="loc"\s+id="nav-loc">LOC</button></li>\n', '', content)
content = re.sub(r'<li><button class="nav-link" data-section="institutes"\s+id="nav-institutes">Institutes</button></li>\n', '', content)

# 2. Make GEANT4 text white
content = content.replace('<span class="title-lg gradient-text">GEANT4</span>', '<span class="title-lg" style="color: #ffffff; filter: drop-shadow(0 0 16px rgba(255,255,255,0.4));">GEANT4</span>')

# 3. Add hero side scrollers
hero_scrollers = """      <div class="hero-section">
      
      <!-- LEFT SCROLLER (SOC) -->
      <div class="hero-side hero-side-left">
        <div class="scroller-vertical" aria-hidden="true">
          <div class="scroller-vertical-inner">
            <div class="scroller-card"><div class="scroller-name">Prof. Pankaj Jain</div><div class="scroller-role">Chair, SOC</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Archana Sharma</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Prof. Ranjeev Misra</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Santosh Kumar</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Prof. Dipankar Bhattacharya</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Varun Bhalerao</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Prof. Subir Sarkar</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Nandita Rana</div><div class="scroller-role">Member</div></div>
            <!-- Duplicate for seamless scrolling -->
            <div class="scroller-card"><div class="scroller-name">Prof. Pankaj Jain</div><div class="scroller-role">Chair, SOC</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Archana Sharma</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Prof. Ranjeev Misra</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Santosh Kumar</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Prof. Dipankar Bhattacharya</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Varun Bhalerao</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Prof. Subir Sarkar</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Nandita Rana</div><div class="scroller-role">Member</div></div>
          </div>
        </div>
      </div>
      
      <!-- RIGHT SCROLLER (LOC) -->
      <div class="hero-side hero-side-right">
        <div class="scroller-vertical" aria-hidden="true" style="animation-direction: reverse;">
          <div class="scroller-vertical-inner">
            <div class="scroller-card"><div class="scroller-name">Prof. Anil Kumar Singal</div><div class="scroller-role">Chair, LOC</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Manjari Bagchi</div><div class="scroller-role">Convenor</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Ramij Raja</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Pankaj Kushwaha</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Tushar Mondal</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Subhash Bose</div><div class="scroller-role">Member</div></div>
            <!-- Duplicate for seamless scrolling -->
            <div class="scroller-card"><div class="scroller-name">Prof. Anil Kumar Singal</div><div class="scroller-role">Chair, LOC</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Manjari Bagchi</div><div class="scroller-role">Convenor</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Ramij Raja</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Pankaj Kushwaha</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Tushar Mondal</div><div class="scroller-role">Member</div></div>
            <div class="scroller-card"><div class="scroller-name">Dr. Subhash Bose</div><div class="scroller-role">Member</div></div>
          </div>
        </div>
      </div>

      <div class="hero-bg-img">"""

content = content.replace('      <div class="hero-section">\n      <div class="hero-bg-img">', hero_scrollers)

# 4. Remove SOC, LOC, Institutes views
# We use regex to find the blocks and remove them
content = re.sub(r'    <!-- ── VIEW: SOC ──.*?(?=    <!-- ── VIEW: REGISTER ──)', '', content, flags=re.DOTALL)

# 5. Add Institutes carousel right before <template id="footer-template">
carousel_html = """  <!-- INSTITUTES CAROUSEL -->
  <div class="institutes-marquee-container">
    <div class="institutes-marquee">
      <div class="institutes-marquee-inner">
        <a href="https://www.iiti.ac.in" target="_blank" rel="noopener noreferrer" class="inst-marquee-card"><div class="inst-icon">&#127963;</div><div class="inst-name">IIT Indore</div><div class="inst-loc">Simrol, Madhya Pradesh</div></a>
        <a href="https://www.tifr.res.in" target="_blank" rel="noopener noreferrer" class="inst-marquee-card"><div class="inst-icon">&#128301;</div><div class="inst-name">TIFR</div><div class="inst-loc">Mumbai, Maharashtra</div></a>
        <a href="https://www.iucaa.in" target="_blank" rel="noopener noreferrer" class="inst-marquee-card"><div class="inst-icon">&#127756;</div><div class="inst-name">IUCAA</div><div class="inst-loc">Pune, Maharashtra</div></a>
        <a href="https://www.iist.ac.in" target="_blank" rel="noopener noreferrer" class="inst-marquee-card"><div class="inst-icon">&#128640;</div><div class="inst-name">IIST</div><div class="inst-loc">Thiruvananthapuram, Kerala</div></a>
        
        <!-- Duplicate for loop -->
        <a href="https://www.iiti.ac.in" target="_blank" rel="noopener noreferrer" class="inst-marquee-card"><div class="inst-icon">&#127963;</div><div class="inst-name">IIT Indore</div><div class="inst-loc">Simrol, Madhya Pradesh</div></a>
        <a href="https://www.tifr.res.in" target="_blank" rel="noopener noreferrer" class="inst-marquee-card"><div class="inst-icon">&#128301;</div><div class="inst-name">TIFR</div><div class="inst-loc">Mumbai, Maharashtra</div></a>
        <a href="https://www.iucaa.in" target="_blank" rel="noopener noreferrer" class="inst-marquee-card"><div class="inst-icon">&#127756;</div><div class="inst-name">IUCAA</div><div class="inst-loc">Pune, Maharashtra</div></a>
        <a href="https://www.iist.ac.in" target="_blank" rel="noopener noreferrer" class="inst-marquee-card"><div class="inst-icon">&#128640;</div><div class="inst-name">IIST</div><div class="inst-loc">Thiruvananthapuram, Kerala</div></a>
      </div>
    </div>
  </div>

  <template id="footer-template">"""

content = content.replace('  <template id="footer-template">', carousel_html)

# Also remove footer links for SOC, LOC, Institutes
content = re.sub(r'\s*<button class="footer-link" data-section="soc">SOC</button>', '', content)
content = re.sub(r'\s*<button class="footer-link" data-section="loc">LOC</button>', '', content)
content = re.sub(r'\s*<button class="footer-link" data-section="institutes">Institutes</button>', '', content)


with open("index.html", "w") as f:
    f.write(content)

