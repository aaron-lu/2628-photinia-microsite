export type ImageAsset = {
  /** Accepts either a local public path or a fully-qualified remote URL. */
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
};

export type ListingFact = {
  value: string;
  label: string;
};

export type AgentRecord = {
  name: string;
  role: string;
  brokerage: string;
  license: string;
  phone: string;
  email: string;
  initials: string;
  profileUrl?: string;
};

export type PropertyResourceModule = {
  enabled: boolean;
  url?: string;
  title: string;
  body: string;
  actionLabel: string;
};

export type PropertySiteData = {
  identity: {
    shortName: string;
    eyebrow: string;
    addressLine1: string;
    addressLine2: string;
    display: {
      wordmarkLead: string;
      wordmarkRest: string;
      wordmarkAriaLabel: string;
      heroTitleLead: string;
      heroTitleRest: string;
    };
    status: string;
    mls: string;
    verifiedOn: string;
  };
  theme: {
    paper: string;
    ink: string;
    accent: string;
    softAccent: string;
    muted: string;
    line: string;
  };
  hero: ImageAsset;
  price: string;
  facts: ListingFact[];
  narrative: {
    kicker: string;
    heading: string;
    paragraphs: string[];
  };
  gallery: ImageAsset[];
  galleryContent: {
    kicker: string;
    heading: string;
    viewAllLabel: string;
    mediaDisclosure: string;
  };
  features: Array<{
    number: string;
    title: string;
    body: string;
    image: ImageAsset;
  }>;
  featuresContent: {
    kicker: string;
    heading: string;
    itemLabel: string;
  };
  neighborhood: {
    kicker: string;
    heading: string;
    introduction: string;
    schoolNote: string;
    sourceLinkLabel: string;
    highlights: Array<{
      title: string;
      body: string;
      url: string;
    }>;
  };
  pullQuote: {
    text: string;
    attribution: string;
  };
  resources: {
    kicker: string;
    heading: string;
  };
  modules: {
    video?: PropertyResourceModule;
    tour?: PropertyResourceModule;
    floorPlan?: PropertyResourceModule;
    map?: PropertyResourceModule & {
      latitude?: number;
      longitude?: number;
    };
  };
  agent: AgentRecord & {
    secondary?: AgentRecord;
  };
  contact: {
    agentKicker: string;
    secondaryAgentLabel: string;
    inquiryKicker: string;
    heading: string;
    introduction: string;
    fields: {
      name: string;
      email: string;
      phone: string;
      optional: string;
      message: string;
    };
    defaultMessage: string;
    submitLabel: string;
    idleStatus: string;
    sentStatus: string;
    mobileCtaLabel: string;
  };
  sources: Array<{ label: string; url: string }>;
  disclosure: string;
  footer: {
    sourcesAriaLabel: string;
    verificationLabel: string;
    photographyLabel: string;
  };
};

/**
 * Reusable listing record. The local paths below are approved web-resolution
 * copies from the listing delivery; any image src may instead be a remote URL
 * such as https://cdn.example.org/listings/property/hero.jpg.
 * Keep print-resolution source files outside the web project.
 */
export const property: PropertySiteData = {
  identity: {
    shortName: "2628 Photinia",
    eyebrow: "Light, volume, and garden rooms in Pleasanton",
    addressLine1: "2628 Photinia Court",
    addressLine2: "Pleasanton, California 94588",
    display: {
      wordmarkLead: "2628",
      wordmarkRest: "Photinia",
      wordmarkAriaLabel: "2628 Photinia Court home",
      heroTitleLead: "2628",
      heroTitleRest: "Photinia Court",
    },
    status: "Active",
    mls: "Bay East MLS #41147570",
    verifiedOn: "September 17, 2026",
  },
  theme: {
    paper: "#f5f1e9",
    ink: "#192b33",
    accent: "#a54a39",
    softAccent: "#d8c8b7",
    muted: "#667079",
    line: "#d5cec4",
  },
  hero: {
    src: "/property/living-room-hero.jpg",
    alt: "Bright double-height living room with fireplace, tall windows, open staircase, and dining area beyond",
    caption: "Approved listing photography",
  },
  price: "$1,698,000",
  facts: [
    { value: "4", label: "Bedrooms" },
    { value: "2.5", label: "Bathrooms" },
    { value: "2,192 SF", label: "Interior" },
    { value: "3,898 SF", label: "Lot" },
    { value: "2-car", label: "Garage" },
    { value: "1999", label: "Year built" },
    { value: "$230/mo", label: "HOA dues" },
  ],
  narrative: {
    kicker: "The residence",
    heading: "Airy at the center, connected from room to room.",
    paragraphs: [
      "Double-height ceilings set the tone in the main living room, where tall windows, an open stair, and plantation shutters draw daylight across the light wood floor. Built-in cabinetry and a dual-sided fireplace create a visual link to the second sitting area without flattening the plan into one room.",
      "The kitchen keeps storage and prep space close at hand with white cabinetry, stone counters, and a center island, opening toward an eat-in area and glass doors to the patio. Upstairs, four bedrooms include a primary suite with a walk-in closet and additional storage.",
      "Outside, the plan unfolds through a sheltered front entry, a courtyard, a pergola-framed patio, and a green side yard. Mature planting gives each outdoor area a distinct sense of enclosure while keeping the spaces connected to the house.",
    ],
  },
  gallery: [
    {
      src: "/property/front-exterior.jpg",
      alt: "Sunlit front facade with red shutters, covered porch, and garage doors",
      caption: "Front exterior",
    },
    {
      src: "/property/front-entry.jpg",
      alt: "Covered front porch with stone-trimmed columns and red entry door",
      caption: "Front entry",
    },
    {
      src: "/property/living-room-wide.jpg",
      alt: "Wide living room view with seating, staircase, and tall windows",
      caption: "Double-height living room",
    },
    {
      src: "/property/dining-room.jpg",
      alt: "Dining area set between shuttered windows and a glass door to the patio",
      caption: "Dining area",
    },
    {
      src: "/property/kitchen-wide.jpg",
      alt: "Wide kitchen with white cabinetry, center island, recessed lights, and a sliding door to the patio",
      caption: "Kitchen",
    },
    {
      src: "/property/family-room.jpg",
      alt: "Second sitting room with shuttered windows, light wood flooring, and a doorway to the hall",
      caption: "Family room",
    },
    {
      src: "/property/kitchen-island.jpg",
      alt: "Angled kitchen view with center island and openings toward the dining and living areas",
      caption: "Kitchen island",
    },
    {
      src: "/property/kitchen-flow.jpg",
      alt: "Kitchen island in the foreground with the sink, cooktop, and dining area beyond",
      caption: "Kitchen flow",
    },
    {
      src: "/property/upper-overlook.jpg",
      alt: "View from the upper landing down into the double-height living room and dining area",
      caption: "Upper overlook",
    },
    {
      src: "/property/upper-landing.jpg",
      alt: "Upper landing with white railings overlooking the level below",
      caption: "Upper landing",
    },
    {
      src: "/property/primary-bedroom.jpg",
      alt: "Staged primary bedroom with ceiling fan and a doorway to the attached bathroom",
      caption: "Primary bedroom",
    },
    {
      src: "/property/primary-bath.jpg",
      alt: "Wide primary bathroom with double vanity, glass shower, soaking tub, and several windows",
      caption: "Primary bathroom",
    },
    {
      src: "/property/outlook.jpg",
      alt: "Elevated view over nearby rooftops and a fenced open area toward distant hills and water",
      caption: "Outlook from the upper level",
    },
    {
      src: "/property/secondary-bedroom-one.jpg",
      alt: "Bright secondary bedroom staged with a single bed, playful dinosaur decor, and a ceiling fan",
      caption: "Secondary bedroom",
    },
    {
      src: "/property/secondary-bedroom-two.jpg",
      alt: "Secondary bedroom staged with a double bed, ceiling fan, and windows on two walls",
      caption: "Secondary bedroom",
    },
    {
      src: "/property/hall-bath.jpg",
      alt: "Bathroom with glass shower, toilet, and white vanity",
      caption: "Bathroom",
    },
    {
      src: "/property/backyard-patio.jpg",
      alt: "Wide backyard patio with lounge seating, mature trees, and a wood fence",
      caption: "Backyard patio",
    },
    {
      src: "/property/rear-exterior.jpg",
      alt: "Rear elevation with patio seating, glass doors, and a narrow lawn area",
      caption: "Rear exterior",
    },
    {
      src: "/property/pergola-patio.jpg",
      alt: "Vine-covered pergola framing the patio and sliding doors, with seating beyond",
      caption: "Pergola patio",
    },
    {
      src: "/property/side-yard.jpg",
      alt: "Narrow green lawn bordered by shrubs, flowering trees, a wood fence, and the home",
      caption: "Side yard",
    },
    {
      src: "/property/court-context.jpg",
      alt: "Paved residential court leading to the two-story stucco home and neighboring facades",
      caption: "Photinia Court",
    },
    {
      src: "/property/living-room-hero.jpg",
      alt: "Bright double-height living room with fireplace, tall windows, open staircase, and dining area beyond",
      caption: "Living room",
    },
  ],
  galleryContent: {
    kicker: "Inside & out",
    heading: "Follow the light through the house.",
    viewAllLabel: "View full gallery",
    mediaDisclosure:
      "Only approved web-resolution listing photography is shown. Source Drive files were left unchanged.",
  },
  features: [
    {
      number: "01",
      title: "A room that reaches upward",
      body: "Tall windows, vaulted volume, and the open stair make the living room the spatial center of the house. The dual-sided fireplace and built-ins carry that sense of connection into the adjacent family room.",
      image: {
        src: "/property/upper-overlook.jpg",
        alt: "Upper-level view into the double-height living room and dining area",
      },
    },
    {
      number: "02",
      title: "Kitchen, dining, patio—one easy sequence",
      body: "The center-island kitchen opens toward everyday dining and glass doors to the patio, keeping cooking, conversation, and outdoor access within one connected part of the plan.",
      image: {
        src: "/property/kitchen-wide.jpg",
        alt: "White kitchen with center island, recessed lights, and a sliding door to the patio",
      },
    },
    {
      number: "03",
      title: "Outdoor rooms with shade and greenery",
      body: "A sheltered courtyard, a pergola-framed rear patio, and a green side yard form distinct outdoor settings for a quiet morning, an open-air meal, or time in the garden.",
      image: {
        src: "/property/pergola-patio.jpg",
        alt: "Vine-covered pergola framing the patio and sliding doors",
      },
    },
  ],
  featuresContent: {
    kicker: "Three perspectives",
    heading: "Space opens up, then steps outside.",
    itemLabel: "Verified listing feature",
  },
  neighborhood: {
    kicker: "Around Stoneridge Place",
    heading: "Parks, practical stops, and regional rail.",
    introduction:
      "The current listing and HOA materials note a shared pool and spa within Stoneridge Place. Beyond the neighborhood, mapped routes connect the address with nearby park space, daily shopping, Pleasanton’s trail network, and BART.",
    schoolNote:
      "The official PUSD locator identifies Henry P. Mohr Elementary, Harvest Park Middle, and Amador Valley High for this address. Boundaries, capacity, overflow placement, and enrollment can change; verify directly with Pleasanton Unified.",
    sourceLinkLabel: "Explore source",
    highlights: [
      {
        title: "Amaral Park",
        body: "A mapped walking route is approximately 0.5 mile. City materials identify playgrounds, picnic areas, ball backstops, and basketball courts.",
        url: "https://weblink.cityofpleasantonca.gov/weblink/0/edoc/300460/01.pdf",
      },
      {
        title: "Pacific Pearl",
        body: "Approximately 0.8 driving mile by a mapped route, with a current mix of grocery, dining, and everyday services. Tenants and hours can change.",
        url: "https://shoppacificpearl.com/",
      },
      {
        title: "Dublin / Pleasanton BART",
        body: "Approximately 3.1 driving miles by a mapped route. BART identifies the station as a Blue Line terminal with local and regional bus connections.",
        url: "https://www.bart.gov/stations/dubl",
      },
    ],
  },
  pullQuote: {
    text: "Volume inside. Garden rooms outside.",
    attribution: "2628 Photinia Court",
  },
  resources: {
    kicker: "Find the address",
    heading: "Orient yourself in Pleasanton.",
  },
  modules: {
    video: {
      enabled: false,
      title: "Property film",
      body: "Watch an approved property film.",
      actionLabel: "Watch film",
    },
    tour: {
      enabled: false,
      title: "Virtual tour",
      body: "Explore the home through an approved hosted tour.",
      actionLabel: "Open tour",
    },
    floorPlan: {
      enabled: false,
      title: "Floor plan",
      body: "Review an approved floor-plan asset.",
      actionLabel: "View floor plan",
    },
    map: {
      enabled: true,
      url: "https://www.google.com/maps/search/?api=1&query=2628+Photinia+Ct+Pleasanton+CA+94588",
      title: "Property location",
      body: "Open the address in Google Maps for current routing and nearby destinations.",
      actionLabel: "Open map",
      latitude: 37.6915857,
      longitude: -121.8584971,
    },
  },
  agent: {
    name: "Shug Sidhu",
    role: "Listing Agent",
    brokerage: "Compass",
    license: "DRE #02031219",
    phone: "(510) 856-6450",
    email: "shug.sidhu@compass.com",
    initials: "SS",
    profileUrl: "https://www.compass.com/agents/shug-sidhu/",
    secondary: {
      name: "Andre Wang",
      role: "Co-listing Agent",
      brokerage: "Compass",
      license: "DRE #02073067",
      phone: "(510) 386-0028",
      email: "andre.wang@compass.com",
      initials: "AW",
      profileUrl: "https://www.compass.com/agents/andre-wang/",
    },
  },
  contact: {
    agentKicker: "Your listing advisor",
    secondaryAgentLabel: "Also listed by",
    inquiryKicker: "Private inquiry",
    heading: "Arrange a closer look at Photinia Court.",
    introduction:
      "Use the verified phone or email links at left to contact the listing team. This preview form does not transmit information.",
    fields: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      optional: "Optional",
      message: "Message",
    },
    defaultMessage: "I’m interested in learning more about 2628 Photinia Court.",
    submitLabel: "Review inquiry",
    idleStatus:
      "Preview form only — nothing will be transmitted. Call or email the listing team to inquire.",
    sentStatus:
      "Nothing was sent. Please call or email Shug Sidhu or Andre Wang using the verified links.",
    mobileCtaLabel: "Contact the listing team",
  },
  sources: [
    {
      label: "MLS 41147570",
      url: "https://www.mlslistings.com/Property/BE41147570/2628-photinia-ct-pleasanton-ca-94588?view=md",
    },
    {
      label: "Pleasanton solar permit",
      url: "https://aca-prod.accela.com/PLEASANTON/Cap/CapDetail.aspx?Module=Building&TabName=Building&capID1=19CAP&capID2=00000&capID3=0012D&agencyCode=PLEASANTON&IsToShowInspection=",
    },
    {
      label: "Stoneridge Place HOA rules",
      url: "https://www.stoneridgeplace.com/automation/awsviewdoc.php?stmt=Disclosures%2FRules+Enforcement+Policy%2FSRP_parking_rr_far2023-02-06+15%3A18%3A43.pdf",
    },
    {
      label: "Pleasanton parks & trails",
      url: "https://www.cityofpleasantonca.gov/your-community/parks-trails/",
    },
    {
      label: "PUSD school locator",
      url: "https://www.pleasantonusd.net/enrollment-registration/school-locator",
    },
    {
      label: "Amaral Park route",
      url: "https://www.google.com/maps/dir/?api=1&origin=2628+Photinia+Ct%2C+Pleasanton%2C+CA+94588&destination=Amaral+Park%2C+3400+Dennis+Dr%2C+Pleasanton%2C+CA+94588&travelmode=walking",
    },
    {
      label: "Pacific Pearl route",
      url: "https://www.google.com/maps/dir/?api=1&origin=2628+Photinia+Ct%2C+Pleasanton%2C+CA+94588&destination=Pacific+Pearl%2C+2693+Stoneridge+Dr%2C+Pleasanton%2C+CA+94588&travelmode=driving",
    },
    {
      label: "Dublin / Pleasanton BART",
      url: "https://www.bart.gov/stations/dubl",
    },
  ],
  disclosure:
    "Information was checked September 17, 2026 against MLSListings/Bay East, public records, HOA materials, and operator sources. The live MLS record showed Active while Compass and Redfin still displayed Coming Soon. Price, status, availability, HOA dues, and agent details may change. Buyer to independently verify all information, including square footage, lot size, rooms, baths, levels, permits, property condition, solar ownership and transfer terms, EV readiness, HOA rules and assessments, school boundaries and capacity, and approximate map distances. No future-use or improvement feasibility is represented. This public link is a review-only preview, not an official brokerage publication; the inquiry form does not transmit data.",
  footer: {
    sourcesAriaLabel: "Information sources",
    verificationLabel: "Review preview · Source-checked",
    photographyLabel: "Photography: approved listing-media set",
  },
};
