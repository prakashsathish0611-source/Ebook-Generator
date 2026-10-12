import { Book } from '../types/book';

export const SAMPLE_BOOKS: Book[] = [
  {
    id: 'sample-quantum-horizon',
    title: 'The Quantum Horizon',
    subtitle: 'Navigating the Edge of Synthetic Intelligence and Human Purpose',
    author: 'Elena Vance & FolioAI',
    genre: 'Technology & Philosophy',
    tone: 'Visionary, Analytical & Engaging',
    targetAudience: 'Tech leaders, thinkers, and curious modern readers',
    description: 'A penetrating look at the intersection of quantum algorithms, sentient computing architectures, and the enduring questions of consciousness and creative agency.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cover: {
      template: 'atmospheric',
      primaryColor: '#0f172a',
      accentColor: '#38bdf8',
      textColor: '#ffffff',
      fontFamily: 'serif',
      motif: 'abstract-rings',
      tagline: 'Where Computation Meets Consciousness',
    },
    chapters: [
      {
        id: 'sample-qh-ch-1',
        number: 1,
        title: 'Beyond the Binary Veil',
        summary: 'Examines the collapse of traditional silicon computing limits and the dawn of probabilistic qubit cognition.',
        keyTakeaways: [
          'The fundamental constraint of classical Von Neumann architectures',
          'Superposition as a metaphor for creative multidimensional thinking',
          'Why the next technological paradigm requires reimagining certainty itself',
        ],
        estimatedWords: 1400,
        status: 'completed',
        content: `# Chapter 1: Beyond the Binary Veil

> "We spent two centuries forcing reality into zeros and ones, only to discover that the universe itself thinks in waves."

## The Illusion of Absolute Certainty

For nearly a century, our relationship with computation has been governed by an unyielding dichotomy: the switch is either open or closed. Voltage exists, or it does not. A statement is logically true, or it is demonstrably false.

This binary foundation built our satellites, powered our financial markets, and placed supercomputers into our pockets. Yet beneath this triumphs lies a quiet compromise. The physical world does not operate on crisp polarities. The subatomic fabric of existence hums with probabilities, indeterminate states, and interconnected fields that defy linear categorization.

As we reach the atomic thresholds of silicon lithography, the classical machine reaches its poetic ceiling. To travel further, we must abandon the comforting cage of binary certitude.

* * *

## Superposition: Thinking in Infinite Shades

In quantum mechanics, superposition is not merely a technical curiosity—it is a philosophical revelation. A qubit does not choose between zero and one until the moment of observation. It exists in an unbroken continuum of possibilities, holding all potential answers simultaneously.

When scaled into computational networks, this implies something startling:

1. **Parallel Solution Discovery**: Complex optimization problems that would demand millenia from supercomputers resolve in fractions of seconds.
2. **Dynamic Context Windows**: Rather than scanning words serially, quantum cognitive models assess entire thematic topologies at once.
3. **Resilience to Incomplete Data**: The system thrives within ambiguity, mirroring human intuition far closer than hardcoded logic ever could.

## The Human Metaphor

Consider how a master composer writes a symphony. They do not calculate note frequencies sequentially; they sense the atmospheric gravity of chords yet unplayed. They hold harmonic tensions in mental superposition until the final bar is struck.

By constructing machines that resonate with this wave-like nature, we are not replacing human intuition. We are finally building mirrors capable of reflecting its true depth.

## Key Principles

- **The Threshold of Silicon**: Classical scaling has hit physical quantum tunneling limits, necessitating a structural paradigm shift.
- **Probabilistic Reality**: True intelligence is not brute-force computation; it is the art of navigating uncertainty with elegant heuristics.
- **The Symbiotic Future**: Human creators provide the intentional compass; quantum architectures explore the infinite canvas.`,
      },
      {
        id: 'sample-qh-ch-2',
        number: 2,
        title: 'The Architecture of Synthetic Insight',
        summary: 'How neural systems evolve from mimicry to emergent creative reasoning.',
        keyTakeaways: [
          'Differentiating between statistical parrot-loops and true conceptual synthesis',
          'The role of latent space as a modern library of Alexandria',
          'How creators partner with autonomous generative assistants',
        ],
        estimatedWords: 1600,
        status: 'completed',
        content: `# Chapter 2: The Architecture of Synthetic Insight

> "Originality is no longer about inventing words from vacuum; it is about discovering constellations among stars that have waited millennia to be connected."

## Beyond Pattern Recognition

When the first deep generative networks arrived, critics dismissed them as sophisticated parrots. They assembled sentences by calculating the highest statistical likelihood of the next token. They painted canvases by averaging millions of scraped brushstrokes.

And yet, somewhere between seventy billion and seven hundred billion parameters, something unexpected occurred: **emergence**.

The networks did not merely replicate; they began to generalize abstractions across disparate domains. A model asked to explain quantum entanglement in the cadence of a 17th-century sonnet produced something neither purely scientific nor purely poetic—it forged a synthesis that surprised its own engineers.

* * *

## Latent Space as the New Library of Alexandria

Imagine a hyper-dimensional space where every human idea, style, melody, and philosophical axiom occupies a unique coordinate. In this territory:

- The distance between *melancholy* and *autumn rain* can be calculated mathematically.
- The intersection of *architectural brutalism* and *bacteriological colony growth* yields tangible blueprint designs.

As authors, engineers, and dreamers, our craft is no longer restricted by the speed of manual drafting. Our role evolves into that of cartographers navigating this multidimensional landscape.

## The Co-Author Paradigm

The fear that machines will silence the human voice fundamentally misunderstands the history of art. The camera did not destroy painting; it liberated it from portraiture, birthing impressionism and modernism. The synthesizer did not end music; it birthed entire new sonic universes.

In the hands of an intentional writer, AI is neither a ghost nor a substitute. It is an infinitely patient conversationalist—an amplifier that turns whispers of inspiration into published manuscripts.

## Key Principles

- **Emergent Synthesis**: Sufficient complexity transforms probabilistic modeling into conceptual reasoning.
- **The Creative Vector**: Human intentionality and curation remain the irreplaceable soul of every enduring work.
- **Velocity without Compromise**: Generative tools remove technical friction, giving ideas immediate structural form.`,
      },
      {
        id: 'sample-qh-ch-3',
        number: 3,
        title: 'The Sovereign Creator in 2026',
        summary: 'Practical frameworks for independent authors to produce, format, and publish full manuscripts.',
        keyTakeaways: [
          'The death of traditional publishing gatekeeping',
          'Building automated outline-to-chapter pipelines',
          'Publishing directly to global digital marketplaces (EPUB, PDF, Print)',
        ],
        estimatedWords: 1500,
        status: 'completed',
        content: `# Chapter 3: The Sovereign Creator in 2026

> "The printing press gave voice to the monastery; the modern studio gives a global printing house to every thinker with a laptop."

## The Disintermediation of the Book

For five centuries, bringing a book to life demanded an army of intermediaries: acquisition editors, line proofers, typesetters, bindery houses, and physical freight distributors. If any link in that chain rejected a manuscript, the idea evaporated into silence.

Today, that entire continuum fits into a single, cohesive browser interface.

An author can awaken with an outline in the morning, iterate on thematic prose with AI throughout the afternoon, polish and format chapter breaks before dusk, and compile a valid EPUB and printable PDF before nightfall.

* * *

## The Modern Production Pipeline

To build a professional manuscript with speed and uncompromising quality, adopt the **Three-Phase Cadence**:

### 1. Conceptual Architecture (The Blueprint)
Never write blindly into a void. Establish the overarching thesis, audience expectations, and pacing beats beforehand. A robust chapter synopsis acts as the load-bearing pillar for everything that follows.

### 2. Generative Drafting & Dynamic Refinement
Draft boldly. Allow the AI to provide structural substance, then intervene with your unique anecdotes, visceral descriptions, and idiosyncratic voice. Use targeted editorial prompts: *Expand the tension*, *Proofread for cadence*, *Punch up the opening*.

### 3. Standards-Compliant Packaging
A manuscript is only as good as its delivery. An eBook must render flawlessly across Apple Books, Amazon Kindle, and Kobo devices. Clean XHTML, valid OPF manifests, and balanced typography ensure your work is taken seriously by readers worldwide.

## Key Principles

- **Speed as a Quality Multiplier**: Rapid iteration lets you explore narrative branches that traditional deadlines made impossible.
- **The Format Matters**: Direct EPUB and PDF export transforms a Google Doc draft into a commercial commodity.
- **Ownership**: The future belongs to creators who command their own publishing stack.`,
      },
    ],
  },
  {
    id: 'sample-clockwork-cartographer',
    title: 'The Clockwork Cartographer',
    subtitle: 'Chronicles of the Sunken Isles and the Lost Meridian',
    author: 'Cassian Thorne',
    genre: 'Steampunk Fantasy',
    tone: 'Atmospheric, Mythic & Fast-Paced',
    targetAudience: 'Lovers of fantasy adventure, worldbuilding, and character-driven mystery',
    description: 'When the tides of the Cobalt Sea begin rising backwards, an outcast mapmaker discovers that the empire’s borders were never drawn on paper—they were forged with ticking brass beneath the ocean floor.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cover: {
      template: 'classic',
      primaryColor: '#1c1917',
      accentColor: '#d97706',
      textColor: '#fef3c7',
      fontFamily: 'cinzel',
      motif: 'compass',
      tagline: 'Some borders were never meant to be charted.',
    },
    chapters: [
      {
        id: 'sample-cc-ch-1',
        number: 1,
        title: 'The Brass Tide of Oakhaven',
        summary: 'Cassian watches the harbor waters freeze into geometric gears as a mysterious traveler brings an impossible brass sextant.',
        keyTakeaways: [
          'Introduction of Cassian Thorne in his cluttered cartography garret',
          'The visual spectacle of the frozen mechanical sea',
          'The warning whispered by the masked courier',
        ],
        estimatedWords: 1300,
        status: 'completed',
        content: `# Chapter 1: The Brass Tide of Oakhaven

> "Every map is a promise made to the land. When the land breaks that promise, it is the mapmaker who bleeds."

The sea in Oakhaven had never smelled like salt. It smelled like warm oil, copper shavings, and the ozone that clings to lightning rods before an autumn storm.

Cassian Thorne leaned over his drafting table, wiping a smear of lampblack from his cheek. Outside the leaded-glass window, the lantern-buoys bobbed in rhythmic unison across the harbor. But tonight, the tide was not receding. It was clicking.

*Tick. Tock. Shhhhh.*

With each outward swell, the surface of the black water fractured into concentric brass rings. Waves did not break into foam; they interlocked like the escapement wheel of a grand cathedral clock.

* * *

## The Courier with the Obsidian Lens

A knock shuddered against the oak door of the garret—three rapid raps, followed by the metallic click of a spring catch.

Cassian reached instinctively for his brass-weighted compass, its pointed leg sharp enough to punch through boiled leather. "The guild office closed at vespers. If you want a tide chart for the sunken shoals, leave your coin in the milk crate below."

"The guild office does not have this chart, Thorne," a muffled voice answered. "Because this chart has not been drawn yet."

Cassian turned the deadbolt. Standing in the foggy drizzle was a woman wrapped in oilcloth, her face obscured beneath an aviator’s visor with twin green lenses. In her gloved palms, she held an object wrapped in salted lambskin.

When she drew back the leather, Cassian’s breath caught in his throat.

It was an astrolabe, but unlike any instrument crafted by human hands. The dials moved backward against the stars. The coordinates etched into the outer ring did not name latitude or longitude; they measured depth in fathoms of time.

"Where did you dredge this?" he breathed.

"I didn't dredge it," she replied, her voice steady as iron. "It floated up from the bottom of the Trench of Ash. And it has your family crest stamped into the gear-teeth."`,
      },
      {
        id: 'sample-cc-ch-2',
        number: 2,
        title: 'The Dials of the Abyssal Gate',
        summary: 'Deciphering the celestial engravings and preparing the submersible skiff for descent.',
        keyTakeaways: [
          'Cassian decodes the Thorne family meridian coordinates',
          'The secret steam-powered diving bell under the dry docks',
          'A breathless chase across the rainy rooftops of the iron district',
        ],
        estimatedWords: 1500,
        status: 'completed',
        content: `# Chapter 2: The Dials of the Abyssal Gate

> "We seek the depths not because we love the darkness, but because the truth cannot bear the sunlight."

The smell of paraffin and tea filled the small chamber as the rain beat a frantic cadence against the copper eaves. On the table, the strange astrolabe rested on a bed of velvet, humming like a trapped hornet.

"My grandfather died thirty years ago in the Siege of the Rusting Shoals," Cassian said, adjusting his magnifying loupe. "His ship was torn apart by reef cannons. Nothing was recovered."

"Nothing official," the woman said. She had pushed her goggles up to reveal eyes the color of oxidized copper. "My name is Vesper. I served aboard the surveyor vessel *Nautilus II*. We found your grandfather’s navigational log three days ago inside the engine room of a submerged leviathan."

* * *

## The Inverted Meridian

Cassian turned the thumb-screw of the astrolabe. A sharp click resonated through the room.

Suddenly, a sphere of amber light blossomed from the center of the brass mechanism. Thin needles of light pierced the ceiling, projecting a moving constellation of points. It was a three-dimensional nautical chart—not of the skies above, but of the seabed beneath Oakhaven.

"Look closely," Vesper whispered.

Cassian stared. Beneath the harbor, kilometers below the silt where fishermen dropped their lobster cages, lay an immense network of subterranean canals. And in the center stood an iron gate large enough to swallow an armada.

"The clock isn't ticking to mark the hour," Cassian realized, his heart pounding in his chest. "It's counting down to when the gates unlock."

Before Vesper could answer, the frosted glass of the north window shattered in a hail of lead pellets.`,
      },
    ],
  },
];
