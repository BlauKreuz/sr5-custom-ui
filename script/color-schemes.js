export const COLOR_SCHEMES = [
  {
    id: 'default',
    label: 'Default',
    // No vars — sr5cui-colors class is NOT added for this scheme,
    // so all color CSS rules are inactive and SR5's own styles apply untouched.
    vars: {}
  },
  {
    id: 'mini',
    label: 'Metal Grey',
    vars: {
      '--sr5cui-bg':                    'linear-gradient(rgba(193, 193, 193, 0.8), rgba(140,144,149,0.8)), url("/modules/sr5-custom-ui/assets/tausta1.png")',
      '--sr5cui-bg-image':              'url("/modules/sr5-custom-ui/assets/tausta1.png")',
      '--sr5cui-bg-overlay':            'linear-gradient(rgba(193, 193, 193, 0.8), rgba(140,144,149,0.8))',
      '--sr5cui-window-border':         'rgba(255,255, 255, 0.5)',
      '--sr5cui-header-bg':             'rgb(0, 0, 0)',
      '--sr5cui-input-bg':              '#000000cc',
      '--sr5cui-input-color':           '#e0e0e0',
            '--sr5cui-text-shadow':           'none',
          /* Roll buttons */
      '--sr5cui-roll-btn-bg':           'rgba(230, 230, 230, 0.3)',
      '--sr5cui-roll-btn-border':       'rgba(0, 0, 0, 0.3)',
      '--sr5cui-roll-btn-hover-bg':     'rgba(17, 90, 0, 0.6)',
      '--sr5cui-roll-btn-hover-border': '#00a827',
      '--sr5cui-roll-btn-hover-shadow': '0 0 5px #40ff0069',
      '--sr5cui-roll-btn-icon-color':   '#ffffff',
         /* Common button (form-dialog, card .button, glitch) */
      '--sr5cui-btn-bg':                '#4b535b',
      '--sr5cui-btn-border':            'rgba(0, 0, 0, 0.6)',
      '--sr5cui-btn-hover-bg':          'rgba(0, 0, 0, 0.6)',
      '--sr5cui-btn-hover-shadow':      '0 0 5px rgba(220, 230, 255, 0.6)',
         /* Cancel button */
      '--sr5cui-cancel-bg':             'rgba(0, 0, 0, 0.15)',
      '--sr5cui-cancel-border':         'rgba(0, 0, 0, 0.6)',
      '--sr5cui-cancel-color':          '#ffffff',
      '--sr5cui-cancel-hover-bg':       'rgba(63, 0, 0, 0.6)',
      '--sr5cui-cancel-hover-border':   'rgba(255, 49, 49, 0.85)',
      '--sr5cui-cancel-hover-color':    '#f5d3d3',
      '--sr5cui-cancel-hover-shadow':   '0 0 5px #ff5555d7',
         /* Icons */
      '--sr5cui-icon-color':             '#ffffff',
         /* Stepper buttons */
      '--sr5cui-stepper-bg':              '#4b535b',
      '--sr5cui-stepper-border':          'rgba(0, 0, 0, 0.6)',
      '--sr5cui-stepper-hover-bg':        'rgb(54 55 56)',
      '--sr5cui-stepper-hover-border':    'rgba(0, 0, 0, 0.6)',
         /* Accent (sheet name gradient, tabs, scrollbar) */
      '--sr5cui-accent':                  '#37414cc6',
      '--sr5cui-edit-mode-bg':             'rgba(92,44,44,1)',         /* same red as SR5 default */
      '--sr5cui-test-row-border':           'rgba(255,255,255,0.4)',    /* test dialog section border */
      '--sr5cui-test-row-shadow':           'rgba(0,0,0,0.5) 0px -8px 15px -5px inset',
         /* Window shadow */
      '--sr5cui-shadow':                  '0 0 15px 8px rgba(25, 25, 25, 0.6)',         
         /* List colors — set to SR5 core values for easy identification */
      '--sr5cui-list-section-color':      '#eb6931',      /* gold #ebb531, same as SR5 .item-section */
      '--sr5cui-list-section-bg':         'black',        /* black, same as SR5 .item-section */
      '--sr5cui-list-section-border':     '#760000',      /* gold #ebb531, same as SR5 .item-section */
      '--sr5cui-list-desc-bg':            'rgba(255, 255, 255, 0.4)',   /* opened list item description background*/
      '--sr5cui-list-desc-color':            'rgba(0, 0, 0, 0.8)', /* opened list item description background*/
      '--sr5cui-list-header-color':       'black',        /* white, inherited in SR5 .list-item-header */
      '--sr5cui-list-item-color':         'white',        /* white, inherited in SR5 .list-item */
      '--sr5cui-list-header-bg':          'rgba(111, 120, 126, 1)',   /* rgba(0, 0, 0, 0.7) SR5 .sr5v2 .list-item.list-item-header */
      '--sr5cui-list-header-border':      '1px solid var(--sr5cui-horizontal-line)',  /* chains to --sr5cui-horizontal-line */
      '--sr5cui-list-img-hover-bg':       '#333333',  /* SR5 .sr5v2 .window-content .tabs a bg */
      '--sr5cui-editor-menu-bg':          'var(--sr5cui-accent)', /* SR5 .sr5v2 .editor.prosemirror .editor.menu background */
         /* Hover + active tab — SR5 core exact values */
      '--sr5cui-hover-text-shadow':       '0 0 4px #ffffffbd',  /* SR5 #c9593f --color-shadow-primary resolved */
      '--sr5cui-hover-color':             '#000000',           /* SR5 #cc5e5e .has-desc:hover, .roll:hover */
      '--sr5cui-tab-bg':                 'linear-gradient(rgb(56 63 71 / 36%), rgb(98 108 119 / 77%) 30%, rgb(44 48 52 / 82%) 70%, rgb(67 80 93 / 52%) 100%), linear-gradient(10deg, rgb(255 255 255 / 50%) 0%, rgb(27 35 47 / 87%) 50%, rgb(255 255 255 / 97%) 100%)',              /* 
     inactive tab background */
      '--sr5cui-tab-color':               '#e0e0e0',                /* inactive tab text color */
      '--sr5cui-tab-shadow':              'none',                   /* inactive tab text-shadow */
      '--sr5cui-tab-active-color':        '#e8ecff',           /* SR5 #55101e .sr5v2 .tabs a.active */
      '--sr5cui-tab-active-shadow':       'black 0 0 3px, white 0 0 10px;',   /* SR5 #c9593f --color-shadow-primary, .sr5 .tabs > a.active */
      '--sr5cui-tab-active-bg':           'var(--sr5cui-list-header-bg)', /* SR5 .sr5v2 .tabs a.active background */
      '--sr5cui-tab-active-box-shadow':   '0 -3px 5px 3px rgba(255, 255, 255, 0.2)', /* SR5 .sr5v2 .tabs a.active box-shadow */

      '--sr5cui-label-color':             '#000000',               /* SR5 .sr5v2 label */
      '--sr5cui-static-label-color':        '#000000',
      '--sr5cui-link-color':              'rgb(229, 229, 229)', /* SR5 .sr5v2 a */
      '--sr5cui-hint-color':              'rgba(0, 0, 0, 0.6)',                 /* SR5 .sr5v2 .form-group p.hint */
      '--sr5cui-horizontal-line':         '#ffffff2d',               /* SR5 .sr5v2 .sheet-footer border-top */
   // '--sr5cui-hr-image':               'linear-gradient(to right, #000000f8 0%, #ffffffb5 50%,  #00000091 100%)', /* not used — CSS hardcodes this gradient */
      '--sr5cui-scrollbar-thumb':         '#ffffff',               /* SR5 scrollbar-color thumb */
      '--sr5cui-scrollbar-track':         '#ffffff40',               /* SR5 scrollbar-color track */
      '--sr5cui-attribute-bg':            '#000000cc',               /* attribute value button/input background */  
      '--sr5cui-input-focus':             '#3f58c9',                 /* input focus outline color */
      '--sr5cui-placeholder-color':       '#939393',                 /* input placeholder text color */
      '--sr5cui-img-container-bg':        '#37414cb3',             /* list-item-image-container background */
         /* Chat card roll-mode accents */
      '--sr5cui-select-opt-bg':             '#2a2a2a',
      '--sr5cui-select-opt-color':           '#e0e0e0',
      '--sr5cui-select-opt-selected-bg':    '#37414c',
      '--sr5cui-select-opt-selected-color':  '#ffffff',
      '--sr5cui-card-public-accent':        'rgb(255, 255, 255)', /* red */
      '--sr5cui-card-gm-accent':            'rgba(80, 120, 255, 0.85)',
      '--sr5cui-card-blind-accent':         'rgba(190, 60, 255, 0.85)',
      '--sr5cui-card-self-accent':          'rgba(87, 87, 87, 0.85)',
      '--sr5cui-card-overlay':              'linear-gradient(rgba(193, 193, 193, 0.8), rgba(140,144,149,0.8))',
       /*   '--sr5cui-card-overlay':              'linear-gradient(rgba(145, 145, 145, 0.7), rgba(145, 145, 145, 0.7))',*/
      '--sr5cui-dark-overlay':              'linear-gradient(rgba(74, 74, 74, 0.8), rgba(74, 74, 74, 0.8))',
      '--sr5cui-card-image':                 'url("/modules/sr5-custom-ui/assets/tausta1.png")'
    }
  },
  
  {
    id: 'neon',
    label: 'Neon Chrome',
    vars: {
      '--sr5cui-bg':                    'linear-gradient(rgba(141, 187, 187, 0.8), rgba(49, 107, 103, 0.8)), url("/modules/sr5-custom-ui/assets/tausta1.png")',
      '--sr5cui-bg-image':              'url("/modules/sr5-custom-ui/assets/tausta1.png")',
      '--sr5cui-bg-overlay':            'linear-gradient(rgba(141, 187, 187, 0.8), rgba(49, 107, 103, 0.8))',
      '--sr5cui-window-border':         'rgba(0,255,224,0.5)',
      '--sr5cui-header-bg':             'rgba(0,10,20,0.95)',
      '--sr5cui-input-bg':              '#0d2321',
      '--sr5cui-input-color':           '#e0ffe0',
      '--sr5cui-text-shadow':           '0 0 5px #79ffe4cc',
        /* Roll buttons */
      '--sr5cui-roll-btn-bg':           '#0a0a1a',
      '--sr5cui-roll-btn-border':       'rgba(0,255,224,0.4)',
      '--sr5cui-roll-btn-hover-bg':     '#001a18',
      '--sr5cui-roll-btn-hover-border': '#00ffe0',
      '--sr5cui-roll-btn-hover-shadow': '0 0 6px rgba(0,255,224,0.5)',
      '--sr5cui-roll-btn-icon-color':   '#00ffe0',
         /* Common button (form-dialog, card .button, glitch) */
      '--sr5cui-btn-bg':                '#193836',
      '--sr5cui-btn-border':            'rgba(0,255,224,0.5)',
      '--sr5cui-btn-hover-shadow':      '0 0 6px rgba(0,255,224,0.5)',
         /* Cancel button — purple to contrast the cyan action buttons */
      '--sr5cui-cancel-bg':             'rgba(15, 0, 30, 0.75)',
      '--sr5cui-cancel-border':         'rgba(255, 0, 51, 0.29)',
      '--sr5cui-cancel-color':          '#e0ffe0',
      '--sr5cui-cancel-hover-bg':       'rgba(30, 0, 55, 0.88)',
      '--sr5cui-cancel-hover-border':   'rgba(255, 0, 51, 0.9)',
      '--sr5cui-cancel-hover-color':    '#ffffff',
      '--sr5cui-cancel-hover-shadow':   '0 0 6px rgba(191,0,255,0.6)',
         /* Icons */
      '--sr5cui-icon-color':             '#00ffe0',
         /* Stepper buttons */
      '--sr5cui-stepper-bg':              '#0d0d20',
      '--sr5cui-stepper-border':          'rgba(0,255,224,0.4)',
      '--sr5cui-stepper-hover-bg':        '#001a18',
      '--sr5cui-stepper-hover-border':    '#00ffe0',
         /* Accent (sheet name gradient, tabs, scrollbar) */
      '--sr5cui-accent':                  '#003732',
      '--sr5cui-edit-mode-bg':            'rgba(190,60,0,0.95)',    /* orange-red: stands out from cyan */
      '--sr5cui-test-row-border':         'rgba(0,255,224,0.35)',   /* matches horizontal-line */
      '--sr5cui-test-row-shadow':         'rgba(0,5,4,0.7) 0px -8px 15px -5px inset',
         /* Window shadow */
      '--sr5cui-shadow':                  '0 0 10px 5px rgba(0, 255, 224, 0.25)',
         /* List colors */
      '--sr5cui-list-section-color':      '#00ffe0',
      '--sr5cui-list-section-bg':         'rgba(0, 20, 18, 0.9)',
      '--sr5cui-list-section-border':     'rgba(0,255,224,0.5)',
      '--sr5cui-list-desc-bg':            'rgba(130, 203, 202, 0.5)',
      '--sr5cui-list-desc-color':         'rgba(0, 0, 0, 0.8)',
      '--sr5cui-list-header-color':       '#00ffe0',
      '--sr5cui-list-item-color':         '#e0ffe0',
      '--sr5cui-list-header-bg':          'rgba(46, 84, 80)',
      '--sr5cui-list-header-border':      '1px solid var(--sr5cui-horizontal-line)',
      '--sr5cui-list-img-hover-bg':       'rgba(0, 255, 224, 0.18)',
         /* Hover + active tab */
      '--sr5cui-hover-text-shadow':       '0 0 8px rgba(0, 255, 224, 0.85)',  /* fixed: was blue */
      '--sr5cui-hover-color':             '#00ffe0',
      '--sr5cui-tab-bg':                 'linear-gradient(to bottom, rgba(0, 255, 224, 0) 0%, rgba(0, 255, 224, 0.04) 35%, rgba(0, 255, 224, 0.22) 50%, rgb(209 174 149 / 6%) 63%, rgb(117 187 178 / 73%) 100%), linear-gradient(to bottom, rgb(93 106 105 / 97%) 0%, rgb(5 26 24 / 90%) 50%, rgba(2, 14, 13, 0.97) 100%)',
      '--sr5cui-tab-color':               'rgba(0,255,224,0.65)',
      '--sr5cui-tab-shadow':              'none',
      '--sr5cui-tab-active-color':        '#ffffff',             /* was #009382 — near-black on near-black */
      '--sr5cui-tab-active-shadow':       '0 0 8px rgba(0, 255, 224, 0.9)',
      '--sr5cui-tab-active-bg':           'var(--sr5cui-list-header-bg)', /* distinctly brighter than inactive */
      '--sr5cui-tab-active-box-shadow':   '0 0 5px 3px rgba(0, 255, 224, 0.2)',

      '--sr5cui-label-color':             '#e3fdfa',
      '--sr5cui-static-label-color':        '#000000',
      '--sr5cui-link-color':              '#e3fdfa',
      '--sr5cui-hint-color':              'rgba(0,255,224,0.5)',
      '--sr5cui-horizontal-line':         'rgba(0,255,224,0.35)',   /* was solid cyan — too vivid */
      '--sr5cui-scrollbar-thumb':         '#00ffe0',
      '--sr5cui-scrollbar-track':         'rgba(0, 20, 18, 0.5)',
      '--sr5cui-attribute-bg':            '#0a0a1a',
      '--sr5cui-input-focus':             '#000000',
      '--sr5cui-placeholder-color':       'rgba(0,255,224,0.45)',
      '--sr5cui-img-container-bg':        '#000000',
      '--sr5cui-editor-menu-bg':          'rgba(0, 10, 8, 0.95)',
      '--sr5cui-select-opt-bg':             '#0a0a1a',
      '--sr5cui-select-opt-color':          '#e0ffe0',
      '--sr5cui-select-opt-selected-bg':    'rgba(0, 255, 224, 0.25)',
      '--sr5cui-select-opt-selected-color': '#00ffe0',
      '--sr5cui-card-public-accent':        'rgb(166, 255, 252)', /* red */
      '--sr5cui-card-gm-accent':            'rgba(80, 120, 255, 0.85)',
      '--sr5cui-card-blind-accent':         'rgba(190, 60, 255, 0.85)',
      '--sr5cui-card-self-accent':          'rgba(87, 87, 87, 0.85)',
         /* Chat card roll-mode backgrounds */
      '--sr5cui-card-image':              'url("/modules/sr5-custom-ui/assets/tausta2.png")',
      '--sr5cui-card-overlay':            'linear-gradient(rgba(141, 187, 187, 0.8), rgba(49, 107, 103, 0.8))',
      '--sr5cui-dark-overlay':            'linear-gradient(rgba(64, 85, 85, 0.7), rgba(23, 51, 51, 0.7))',
    }
  },
  {
    id: 'corp',
    label: 'Corporate Blue',
    vars: {
      '--sr5cui-bg':                    'linear-gradient(rgba(206, 209, 216, 0.9), rgba(146, 150, 161, 0.9)), url("/modules/sr5-custom-ui/assets/tausta1.png")',
      '--sr5cui-bg-image':              'url("/modules/sr5-custom-ui/assets/tausta1.png")',
      '--sr5cui-bg-overlay':            'linear-gradient(rgba(206, 209, 216, 0.9), rgba(146, 150, 161, 0.9))',


      '--sr5cui-window-border':         'rgba(140,170,200,0.45)',    /* was 30% white — barely visible */
      '--sr5cui-header-bg':             'rgba(18, 22, 38, 0.97)',
      '--sr5cui-input-bg':              '#1e2232',
      '--sr5cui-input-color':           '#ffffff',
                  '--sr5cui-text-shadow':           'none',
         /* Roll buttons */
      '--sr5cui-roll-btn-bg':           '#1e2232',
      '--sr5cui-roll-btn-border':       '#8ba2c8',
      '--sr5cui-roll-btn-hover-bg':     '#263040',
      '--sr5cui-roll-btn-hover-border': '#5599cc',
      '--sr5cui-roll-btn-hover-shadow': '0 0 5px rgba(85, 153, 204, 0.4)',
      '--sr5cui-roll-btn-icon-color':   '#8aadcc',
         /* Common button (form-dialog, card .button, glitch) */
      '--sr5cui-btn-bg':                '#344769',
      '--sr5cui-btn-border':            '#7997c9',
      '--sr5cui-btn-hover-shadow':      '0 0 5px rgba(85, 153, 204, 0.5)',
         /* Cancel button — was ~10% opacity on all props, completely invisible */
      '--sr5cui-cancel-bg':             'rgba(28, 26, 42, 0.85)',
      '--sr5cui-cancel-border':         'rgba(110,100,145,0.65)',
      '--sr5cui-cancel-color':          '#ccd5e5',
      '--sr5cui-cancel-hover-bg':       'rgba(75, 16, 16, 0.88)',
      '--sr5cui-cancel-hover-border':   'rgba(185, 48, 48, 0.85)',
      '--sr5cui-cancel-hover-color':    '#f0d5d5',
      '--sr5cui-cancel-hover-shadow':   '0 0 5px rgba(200, 50, 50, 0.45)',
         /* Icons */
      '--sr5cui-icon-color':             '#ffffff',
         /* Stepper buttons */
      '--sr5cui-stepper-bg':              '#1e2232',
      '--sr5cui-stepper-border':          '#3d5575',
      '--sr5cui-stepper-hover-bg':        '#263040',
      '--sr5cui-stepper-hover-border':    '#5599cc',
         /* Accent — corporate navy instead of dark red */
      '--sr5cui-accent':                  '#1e2e4a',
      '--sr5cui-edit-mode-bg':             'rgba(155,100,0,0.95)',  /* amber-gold: stands out from navy */
      '--sr5cui-test-row-border':          'rgba(100,140,180,0.4)', /* blue-grey, matches the corp palette */
      '--sr5cui-test-row-shadow':          'rgba(0,0,8,0.6) 0px -8px 15px -5px inset',
         /* Window shadow */
      '--sr5cui-shadow':                  '0 0 15px 5px rgba(18, 28, 50, 0.7)',
         /* List colors */
      '--sr5cui-list-section-color':      '#b8ccdf',
      '--sr5cui-list-section-bg':         'rgba(14, 18, 30, 0.95)',
      '--sr5cui-list-section-border':     '#3d5575',
      '--sr5cui-list-desc-bg':            'rgb(183, 186, 195)',
      '--sr5cui-list-desc-color':         'rgba(0, 0, 0, 0.8)',
      '--sr5cui-list-header-color':       '#b0c4d8',
      '--sr5cui-list-item-color':         '#ccd5e5',
      '--sr5cui-list-header-bg':          'rgb(126, 132, 144)',
      '--sr5cui-list-header-border':      '1px solid var(--sr5cui-horizontal-line)',
      '--sr5cui-list-img-hover-bg':       'rgba(51, 88, 130, 0.4)',
         /* Hover + active tab */
      '--sr5cui-hover-text-shadow':       '0 0 8px rgba(85, 153, 204, 0.6)',
      '--sr5cui-hover-color':             '#ffffff',
      '--sr5cui-tab-bg':                 'rgba(38, 44, 68, 0.8)',
      '--sr5cui-tab-color':               '#9eb8d5',
      '--sr5cui-tab-shadow':              'none',
      '--sr5cui-tab-active-color':        '#1e2131',     /* was #5599cc — too dim on similar-shade active bg */
      '--sr5cui-tab-active-shadow':       '0 0 6px rgba(255, 255, 255, 0.6)',
      '--sr5cui-tab-active-bg':           'var(--sr5cui-list-header-bg)',  /* was same shade as inactive */
      '--sr5cui-tab-active-box-shadow':   '0 0 5px 2px rgba(85, 153, 204, 0.22)',

      '--sr5cui-label-color':             '#000000',
      '--sr5cui-static-label-color':        '#000000',
      '--sr5cui-link-color':              '#0f2e66',
      '--sr5cui-hint-color':              'rgba(130,162,195,0.7)',
      '--sr5cui-horizontal-line':         '#506986',     /* was #445566 — slightly more visible */
      '--sr5cui-scrollbar-thumb':         '#4f67a0',     /* was #334455 — far too dark to see */
      '--sr5cui-scrollbar-track':         'rgb(0, 0, 0)',
      '--sr5cui-attribute-bg':            '#1e2232',
      '--sr5cui-input-focus':             '#5599cc',
      '--sr5cui-placeholder-color':       'rgba(130,165,200,0.6)',
      '--sr5cui-img-container-bg':        '#2b436e',
      '--sr5cui-editor-menu-bg':          'var(--sr5cui-accent)',
      '--sr5cui-select-opt-bg':             '#1e2232',
      '--sr5cui-select-opt-color':          '#ccd5e5',
      '--sr5cui-select-opt-selected-bg':    '#2a3a4a',
      '--sr5cui-select-opt-selected-color': '#5599cc',
      '--sr5cui-card-public-accent':        'rgb(255, 255, 255)', /* red */
      '--sr5cui-card-gm-accent':            'rgba(80, 120, 255, 0.85)',
      '--sr5cui-card-blind-accent':         'rgba(190, 60, 255, 0.85)',
      '--sr5cui-card-self-accent':          'rgba(87, 87, 87, 0.85)',
         /* Chat card roll-mode backgrounds */
      '--sr5cui-card-image':              'url("/modules/sr5-custom-ui/assets/tausta3.png")',
      '--sr5cui-card-overlay':            'linear-gradient(rgba(200, 205, 215, 0.65), rgba(146, 150, 161, 0.9))',
      '--sr5cui-dark-overlay':            'linear-gradient(rgba(86, 90, 101, 0.5), rgba(79, 82, 96, 0.4))',
    }
  },
    {
    id: '4e',
    label: '4e',
    vars: {
      '--sr5cui-bg':                    'linear-gradient(rgba(3,7,9,0.6), rgba(6,10,12,0.85)), url("/modules/sr5-custom-ui/assets/tausta4.png")',
      '--sr5cui-bg-image':              'url("/modules/sr5-custom-ui/assets/tausta4.png")',
      '--sr5cui-bg-overlay':            'linear-gradient(rgba(3,7,9,0.6), rgba(6,10,12,0.85))',
      '--sr5cui-window-border':         'rgba(0,185,175,0.35)',    /* was near-black — invisible */
      '--sr5cui-header-bg':             'rgba(4,10,12,0.97)',
      '--sr5cui-input-bg':              '#071014cc',
      '--sr5cui-input-color':           '#dffaf8',
         /* Roll buttons */
      '--sr5cui-roll-btn-bg':           '#071014',
      '--sr5cui-roll-btn-border':       'rgba(0,217,208,0.45)',    /* was 25% — too faint */
      '--sr5cui-roll-btn-hover-bg':     '#022022',
      '--sr5cui-roll-btn-hover-border': '#00d9d0',
      '--sr5cui-roll-btn-hover-shadow': '0 0 8px rgba(0,232,222,0.45)',
      '--sr5cui-roll-btn-icon-color':   '#9ff6f1',
         /* Common button (form-dialog, card .button, glitch) */
      '--sr5cui-btn-bg':                '#071014',
      '--sr5cui-btn-border':            'rgba(0,217,208,0.45)',
      '--sr5cui-btn-hover-shadow':      '0 0 8px rgba(0, 217, 208, 0.4)',
         /* Cancel button — was 20% bg + black border, completely invisible */
      '--sr5cui-cancel-bg':             'rgba(4, 14, 18, 0.78)',
      '--sr5cui-cancel-border':         'rgba(0,185,175,0.5)',
      '--sr5cui-cancel-color':          '#e6f8f6',
      '--sr5cui-cancel-hover-bg':       'rgba(55, 5, 10, 0.88)',
      '--sr5cui-cancel-hover-border':   'rgba(255,80,100,0.75)',
      '--sr5cui-cancel-hover-color':    '#ffdfe0',
      '--sr5cui-cancel-hover-shadow':   '0 0 6px rgba(255,80,100,0.4)',
         /* Icons */
      '--sr5cui-icon-color':            '#9ff6f1',
         /* Stepper buttons */
      '--sr5cui-stepper-bg':            '#071014',
      '--sr5cui-stepper-border':        'rgba(0,190,180,0.45)',    /* was black — invisible */
      '--sr5cui-stepper-hover-bg':      '#021a1a',
      '--sr5cui-stepper-hover-border':  '#00d9d0',
         /* Accent */
      '--sr5cui-accent':                '#00e3d7cc',
      '--sr5cui-edit-mode-bg':           'rgba(170,35,25,0.95)',   /* deep red: stands out from dark teal */
      '--sr5cui-test-row-border':         'rgba(0,185,175,0.4)',    /* matches horizontal-line */
      '--sr5cui-test-row-shadow':         'rgb(87 255 250 / 40%) 0px 8px 30px -5px inset',
         /* Window shadow */
      '--sr5cui-shadow':                '0 0 10px 5px rgba(0, 210, 200, 0.3)', /* was 0.08 — invisible */
         /* List colors */
      '--sr5cui-list-section-color':    '#00e3d7',
      '--sr5cui-list-section-bg':       'rgba(4,8,10,0.9)',
      '--sr5cui-list-section-border':   'rgba(0,155,145,0.55)',    /* was #00393a — near-black */
      '--sr5cui-list-desc-bg':          'rgb(55, 55, 55)',
      '--sr5cui-list-desc-color':       'rgb(215, 215, 215)',
      '--sr5cui-list-header-color':     '#cffdfa',
      '--sr5cui-list-item-color':       '#e9fffe',
      '--sr5cui-list-header-bg':        'rgba(8,16,18,0.9)',
      '--sr5cui-list-header-border':    '1px solid var(--sr5cui-horizontal-line)',
      '--sr5cui-list-img-hover-bg':     'rgba(0, 220, 200, 0.18)', /* was 0.08 — invisible */
         /* Hover + active tab */
      '--sr5cui-hover-text-shadow':     '0 0 10px rgba(0, 220, 200, 0.7)',
      '--sr5cui-hover-color':           '#00d9d0',
      '--sr5cui-tab-bg':                'rgba(4, 8, 10, 0.82)',
      '--sr5cui-tab-color':             '#7acfcc',
      '--sr5cui-tab-shadow':            'none',
      '--sr5cui-tab-active-color':      '#a8f4f0',    /* was #003334 — near-black on near-black */
      '--sr5cui-tab-active-shadow':     '0 0 8px rgba(0, 220, 200, 0.65)',
      '--sr5cui-tab-active-bg':         'rgba(0, 28, 26, 1)',      /* distinctly different from inactive */
      '--sr5cui-tab-active-box-shadow': '0 0 5px 3px rgba(0, 210, 200, 0.22)', /* was 0.08 — invisible */

      '--sr5cui-label-color':           '#15d4c7',
      '--sr5cui-static-label-color':      '#6d6d6d',
      '--sr5cui-link-color':            '#e9fffe',
      '--sr5cui-hint-color':            'rgba(200,250,248,0.7)',
      '--sr5cui-horizontal-line':       'rgba(0,185,175,0.4)',     /* was #004140 — near-black */
      '--sr5cui-scrollbar-thumb':       '#00d9d0',
      '--sr5cui-scrollbar-track':       'rgba(0,0,0,0.35)',
      '--sr5cui-attribute-bg':          '#061012cc',
      '--sr5cui-input-focus':           '#00e3d7',
      '--sr5cui-placeholder-color':     'rgba(111,191,185,0.7)',
      '--sr5cui-img-container-bg':      'transparent',
      '--sr5cui-editor-menu-bg':        'rgba(4, 10, 12, 0.95)',
         /* Checkbox vars */
      '--sr5cui-checkbox-bg':               '#000000',
      '--sr5cui-checkbox-border':           '#123536',
      '--sr5cui-checkbox-checked-border':   '#00e3d7',
      '--sr5cui-checkbox-mark-color':       '#eaffff',
      '--sr5cui-select-opt-bg':             '#071014',
      '--sr5cui-select-opt-color':          '#dffaf8',
      '--sr5cui-select-opt-selected-bg':    'rgba(0, 217, 208, 0.2)',
      '--sr5cui-select-opt-selected-color': '#00e3d7',
      '--sr5cui-card-public-accent':        'rgb(255, 255, 255)', /* red */
      '--sr5cui-card-gm-accent':            'rgba(80, 120, 255, 0.85)',
      '--sr5cui-card-blind-accent':         'rgba(190, 60, 255, 0.85)',
      '--sr5cui-card-self-accent':          'rgba(87, 87, 87, 0.85)',
         /* Chat card roll-mode backgrounds */
      '--sr5cui-card-image':            'url("/modules/sr5-custom-ui/assets/tausta4.png")',
      '--sr5cui-card-overlay':          'linear-gradient(rgba(140, 171, 180, 0.75), rgba(112, 139, 146, 0.65))',
      '--sr5cui-dark-overlay':          'linear-gradient(rgba(1, 5, 7, 0.90), rgba(2, 6, 8, 0.85))',
    }
  }


];
