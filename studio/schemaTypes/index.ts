import type {SchemaTypeDefinition} from 'sanity'

// Shared objects
import {contentStatus} from './objects/contentStatus'
import {proofVerification} from './objects/proofVerification'
import {seo} from './objects/seo'
import {cta} from './objects/cta'
import {mediaImage} from './objects/mediaImage'
import {themeChoice} from './objects/themeChoice'
import {layoutVariant} from './objects/layoutVariant'
import {link} from './objects/link'
import {growthPlanOutcome} from './objects/growthPlanOutcome'

// Singletons & site configuration
import {siteSettings} from './documents/siteSettings'
import {navigation} from './documents/navigation'
import {megaMenu} from './documents/megaMenu'
import {footer} from './documents/footer'
import {formSettings} from './documents/formSettings'

// Pages & modular sections
import {page} from './documents/page'
import {heroConnectedUniverse} from './sections/heroConnectedUniverse'
import {editorialStatement} from './sections/editorialStatement'
import {goalExplorer} from './sections/goalExplorer'
import {growthJourney} from './sections/growthJourney'
import {startingPointSelector} from './sections/startingPointSelector'
import {servicesExplorer} from './sections/servicesExplorer'
import {toolUniverse} from './sections/toolUniverse'
import {deliveryModels} from './sections/deliveryModels'
import {processSteps} from './sections/processSteps'
import {whyInfiniteWeblinks} from './sections/whyInfiniteWeblinks'
import {faqSection} from './sections/faqSection'
import {finalCtaBanner} from './sections/finalCtaBanner'
import {richText} from './sections/richText'
import {mediaFeature} from './sections/mediaFeature'
import {logoStrip} from './sections/logoStrip'
import {contactPrompt} from './sections/contactPrompt'
// Placeholder-gated / M7-M8-linked sections — see each file's header comment.
import {roadmapShowcase} from './sections/roadmapShowcase'
import {caseStudyShowcase} from './sections/caseStudyShowcase'
import {testimonialWall} from './sections/testimonialWall'

// Taxonomy (the graph)
import {goal} from './documents/goal'
import {growthStage} from './documents/growthStage'
import {crossCuttingSystem} from './documents/crossCuttingSystem'
import {deliveryModel} from './documents/deliveryModel'
import {businessType} from './documents/businessType'
import {startingPoint} from './documents/startingPoint'
import {serviceCategory} from './documents/serviceCategory'
import {service} from './documents/service'
import {toolCategory} from './documents/toolCategory'
import {tool} from './documents/tool'

// Taxonomy — roadmap (M7)
import {roadmap} from './documents/roadmap'

// Content & editorial (M8)
import {article} from './documents/article'
import {resource} from './documents/resource'
import {example} from './documents/example'
import {caseStudy} from './documents/caseStudy'
import {testimonial} from './documents/testimonial'
import {legalPage} from './documents/legalPage'

// Content & rules
import {faq} from './documents/faq'
import {growthPlanRuleSet} from './documents/growthPlanRuleSet'

/**
 * The complete content model is designed up front (data-model.md "Progressive implementation");
 * schemas are built in slices. Milestone M3 (initial slice) plus Milestones M7 (`roadmap`) and M8
 * (`article`/`resource`/`example`/`caseStudy`/`testimonial`/`legalPage`) are now all part of this
 * schema. `solution` and `ctaLibrary` are still NOT part of this slice — add them here only when
 * their milestone begins.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects
  contentStatus,
  proofVerification,
  seo,
  cta,
  mediaImage,
  themeChoice,
  layoutVariant,
  link,
  growthPlanOutcome,

  // Site configuration (singletons pinned in the desk structure)
  siteSettings,
  navigation,
  megaMenu,
  footer,
  formSettings,

  // Pages & sections
  page,
  heroConnectedUniverse,
  editorialStatement,
  goalExplorer,
  growthJourney,
  startingPointSelector,
  servicesExplorer,
  toolUniverse,
  deliveryModels,
  processSteps,
  whyInfiniteWeblinks,
  faqSection,
  finalCtaBanner,
  richText,
  mediaFeature,
  logoStrip,
  contactPrompt,
  roadmapShowcase,
  caseStudyShowcase,
  testimonialWall,

  // Taxonomy
  goal,
  growthStage,
  crossCuttingSystem,
  deliveryModel,
  businessType,
  startingPoint,
  serviceCategory,
  service,
  toolCategory,
  tool,
  roadmap,

  // Content & editorial
  article,
  resource,
  example,
  caseStudy,
  testimonial,
  legalPage,

  // Content & rules
  faq,
  growthPlanRuleSet,
]
