// Internationalization (i18n) System for Netria Website
class I18n {
    constructor() {
        this.currentLang = 'en';
        this.translations = {
            en: {
                nav: {
                    about: 'About',
                    services: 'Services',
                    contact: 'Contact'
                },
                drawer: {
                    title: 'Select Language'
                },
                hero: {
                    title: {
                        prefix: 'Transforming Digital Services in',
                        highlight: 'Morocco'
                    },
                    subtitle: 'We develop solutions that help businesses tackle the most pertinent points of friction in their journey towards financial and social success.',
                    cta: {
                        primary: "Let's Build Together",
                        secondary: 'Our Services'
                    }
                },
                about: {
                    title: 'About Netria',
                    subtitle: 'Your partner in digital transformation',
                    mission: {
                        title: 'Our Mission',
                        text: "We're dedicated to improving digital services across Morocco, helping businesses overcome technological barriers and achieve their full potential in the digital economy."
                    },
                    why: {
                        title: 'Why Choose Netria?',
                        benefit1: 'Deep understanding of Moroccan business landscape',
                        benefit2: 'Custom solutions tailored to your specific needs',
                        benefit3: 'Focus on eliminating friction points in your operations',
                        benefit4: 'Commitment to your financial and social success'
                    },
                    stats: {
                        stat1: {
                            number: '100%',
                            label: 'Moroccan Focus'
                        },
                        stat2: {
                            number: 'Custom',
                            label: 'Solutions'
                        },
                        stat3: {
                            number: 'Results',
                            label: 'Driven'
                        }
                    }
                },
                services: {
                    title: 'Our Services',
                    subtitle: 'Solutions that drive your success',
                    card1: {
                        title: 'Custom Software Development',
                        description: 'Tailored applications designed to solve your specific business challenges and streamline operations.'
                    },
                    card2: {
                        title: 'Digital Transformation',
                        description: 'Modernize your business processes with cutting-edge digital solutions that eliminate friction points.'
                    },
                    card3: {
                        title: 'Business Intelligence',
                        description: 'Data-driven insights to help you make informed decisions and optimize your business performance.'
                    },
                    card4: {
                        title: 'Web & Mobile Solutions',
                        description: 'Responsive web applications and mobile solutions that connect you with your customers effectively.'
                    }
                },
                contact: {
                    title: 'Ready to Transform Your Business?',
                    subtitle: "Let's discuss how we can help you achieve your goals",
                    info: {
                        title: 'Get in Touch',
                        description: 'Ready to tackle those friction points and accelerate your journey to success? We\'re here to help.',
                        location: 'Kenitra, Morocco'
                    },
                    form: {
                        name: 'Your Name',
                        email: 'Your Email',
                        company: 'Company Name',
                        message: 'Tell us about your project or challenges...',
                        submit: 'Send Message'
                    }
                },
                footer: {
                    tagline: 'Transforming digital services in Morocco',
                    rights: 'All rights reserved.'
                }
            },
            fr: {
                nav: {
                    about: 'À propos',
                    services: 'Services',
                    contact: 'Contact'
                },
                drawer: {
                    title: 'Sélectionner la Langue'
                },
                hero: {
                    title: {
                        prefix: 'Transformer les Services Numériques au',
                        highlight: 'Maroc'
                    },
                    subtitle: 'Nous développons des solutions qui aident les entreprises à résoudre les points de friction les plus pertinents dans leur parcours vers le succès financier et social.',
                    cta: {
                        primary: 'Construisons Ensemble',
                        secondary: 'Nos Services'
                    }
                },
                about: {
                    title: 'À propos de Netria',
                    subtitle: 'Votre partenaire en transformation numérique',
                    mission: {
                        title: 'Notre Mission',
                        text: 'Nous nous consacrons à l\'amélioration des services numériques au Maroc, aidant les entreprises à surmonter les barrières technologiques et à atteindre leur plein potentiel dans l\'économie numérique.'
                    },
                    why: {
                        title: 'Pourquoi Choisir Netria?',
                        benefit1: 'Compréhension approfondie du paysage commercial marocain',
                        benefit2: 'Solutions personnalisées adaptées à vos besoins spécifiques',
                        benefit3: 'Focus sur l\'élimination des points de friction dans vos opérations',
                        benefit4: 'Engagement envers votre succès financier et social'
                    },
                    stats: {
                        stat1: {
                            number: '100%',
                            label: 'Focus Marocain'
                        },
                        stat2: {
                            number: 'Solutions',
                            label: 'Sur Mesure'
                        },
                        stat3: {
                            number: 'Résultats',
                            label: 'Orientés'
                        }
                    }
                },
                services: {
                    title: 'Nos Services',
                    subtitle: 'Des solutions qui stimulent votre succès',
                    card1: {
                        title: 'Développement Logiciel Sur Mesure',
                        description: 'Applications personnalisées conçues pour résoudre vos défis commerciaux spécifiques et rationaliser les opérations.'
                    },
                    card2: {
                        title: 'Transformation Numérique',
                        description: 'Modernisez vos processus commerciaux avec des solutions numériques de pointe qui éliminent les points de friction.'
                    },
                    card3: {
                        title: 'Intelligence Commerciale',
                        description: 'Aperçus basés sur les données pour vous aider à prendre des décisions éclairées et optimiser vos performances commerciales.'
                    },
                    card4: {
                        title: 'Solutions Web et Mobiles',
                        description: 'Applications web réactives et solutions mobiles qui vous connectent efficacement avec vos clients.'
                    }
                },
                contact: {
                    title: 'Prêt à Transformer Votre Entreprise?',
                    subtitle: 'Discutons de la façon dont nous pouvons vous aider à atteindre vos objectifs',
                    info: {
                        title: 'Contactez-nous',
                        description: 'Prêt à résoudre ces points de friction et accélérer votre parcours vers le succès? Nous sommes là pour vous aider.',
                        location: 'Kénitra, Maroc'
                    },
                    form: {
                        name: 'Votre Nom',
                        email: 'Votre Email',
                        company: 'Nom de l\'Entreprise',
                        message: 'Parlez-nous de votre projet ou de vos défis...',
                        submit: 'Envoyer le Message'
                    }
                },
                footer: {
                    tagline: 'Transformation des services numériques au Maroc',
                    rights: 'Tous droits réservés.'
                }
            },
            ar: {
                nav: {
                    about: 'نبذة عن',
                    services: 'الخدمات',
                    contact: 'اتصل بنا'
                },
                drawer: {
                    title: 'اختر اللغة'
                },
                hero: {
                    title: {
                        prefix: 'تحويل الخدمات الرقمية في',
                        highlight: 'المغرب'
                    },
                    subtitle: 'نطور حلولاً تساعد الشركات على معالجة أهم نقاط الاحتكاك في رحلتها نحو النجاح المالي والاجتماعي.',
                    cta: {
                        primary: 'دعنا نبني معاً',
                        secondary: 'خدماتنا'
                    }
                },
                about: {
                    title: 'نبذة عن نيتريا',
                    subtitle: 'شريكك في التحول الرقمي',
                    mission: {
                        title: 'مهمتنا',
                        text: 'نحن مكرسون لتحسين الخدمات الرقمية في جميع أنحاء المغرب، ومساعدة الشركات على التغلب على الحواجز التكنولوجية وتحقيق إمكاناتها الكاملة في الاقتصاد الرقمي.'
                    },
                    why: {
                        title: 'لماذا تختار نيتريا؟',
                        benefit1: 'فهم عميق للمشهد التجاري المغربي',
                        benefit2: 'حلول مخصصة مصممة لاحتياجاتك المحددة',
                        benefit3: 'التركيز على القضاء على نقاط الاحتكاك في عملياتك',
                        benefit4: 'الالتزام بنجاحك المالي والاجتماعي'
                    },
                    stats: {
                        stat1: {
                            number: '100%',
                            label: 'تركيز مغربي'
                        },
                        stat2: {
                            number: 'حلول',
                            label: 'مخصصة'
                        },
                        stat3: {
                            number: 'نتائج',
                            label: 'موجهة'
                        }
                    }
                },
                services: {
                    title: 'خدماتنا',
                    subtitle: 'حلول تدفع نجاحك',
                    card1: {
                        title: 'تطوير البرمجيات المخصصة',
                        description: 'تطبيقات مصممة خصيصاً لحل تحديات عملك المحددة وتبسيط العمليات.'
                    },
                    card2: {
                        title: 'التحول الرقمي',
                        description: 'حديث عمليات عملك مع حلول رقمية متطورة تقضي على نقاط الاحتكاك.'
                    },
                    card3: {
                        title: 'الذكاء التجاري',
                        description: 'رؤى مدفوعة بالبيانات لمساعدتك على اتخاذ قرارات مستنيرة وتحسين أداء عملك.'
                    },
                    card4: {
                        title: 'حلول الويب والجوال',
                        description: 'تطبيقات ويب متجاوبة وحلول جوال تربطك بعملائك بفعالية.'
                    }
                },
                contact: {
                    title: 'مستعد لتحويل عملك؟',
                    subtitle: 'دعنا نناقش كيف يمكننا مساعدتك في تحقيق أهدافك',
                    info: {
                        title: 'تواصل معنا',
                        description: 'مستعد لمعالجة نقاط الاحتكاك هذه وتسريع رحلتك نحو النجاح؟ نحن هنا للمساعدة.',
                        location: 'القنيطرة، المغرب'
                    },
                    form: {
                        name: 'اسمك',
                        email: 'بريدك الإلكتروني',
                        company: 'اسم الشركة',
                        message: 'أخبرنا عن مشروعك أو تحدياتك...',
                        submit: 'إرسال الرسالة'
                    }
                },
                footer: {
                    tagline: 'تحويل الخدمات الرقمية في المغرب',
                    rights: 'جميع الحقوق محفوظة.'
                }
            }
        };

        this.init();
    }

    init() {
        // Load saved language preference
        const savedLang = localStorage.getItem('netria-lang');
        if (savedLang && this.translations[savedLang]) {
            this.currentLang = savedLang;
        }

        // Set up language selector
        this.setupLanguageSelector();

        // Apply initial language
        this.applyLanguage(this.currentLang);

        // Update HTML lang attribute
        this.updateHtmlLang();

        // Update document direction for Arabic
        this.updateDocumentDirection(this.currentLang);

        // Set initial dropdown display
        this.updateDropdownDisplay(this.currentLang);
    }

    setupLanguageSelector() {
        const drawerBtn = document.getElementById('langDrawerBtn');
        const drawer = document.getElementById('langDrawer');
        const drawerClose = document.getElementById('langDrawerClose');
        const langOptions = document.querySelectorAll('.lang-drawer-option');

        // Open drawer
        drawerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            drawer.classList.add('active');
            document.body.classList.add('drawer-active');
        });

        // Close drawer
        drawerClose.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeDrawer();
        });

        // Handle language selection
        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = option.getAttribute('data-lang');
                if (lang && this.translations[lang]) {
                    this.switchLanguage(lang);
                    // Close drawer after a short delay to show the selection
                    setTimeout(() => {
                        this.closeDrawer();
                    }, 300);
                }
            });
        });

        // Close drawer when clicking outside
        drawer.addEventListener('click', (e) => {
            if (e.target === drawer) {
                this.closeDrawer();
            }
        });

        // Close drawer on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('active')) {
                this.closeDrawer();
            }
        });
    }

    closeDrawer() {
        const drawer = document.getElementById('langDrawer');
        drawer.classList.remove('active');
        document.body.classList.remove('drawer-active');
    }

    switchLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('netria-lang', lang);

        // Update dropdown display
        this.updateDropdownDisplay(lang);

        // Apply language
        this.applyLanguage(lang);

        // Update HTML lang attribute
        this.updateHtmlLang();

        // Update document direction for Arabic
        this.updateDocumentDirection(lang);

        // Dispatch language change event
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    updateDropdownDisplay(lang) {
        const langOptions = document.querySelectorAll('.lang-drawer-option');

        // Update active option
        langOptions.forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
    }

    applyLanguage(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getNestedTranslation(this.translations[lang], key);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Handle placeholders
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getNestedTranslation(this.translations[lang], key);
            if (translation) {
                element.placeholder = translation;
            }
        });
    }

    getNestedTranslation(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    updateHtmlLang() {
        document.documentElement.lang = this.currentLang;
    }

    updateDocumentDirection(lang) {
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
            document.body.classList.add('rtl');
        } else {
            document.documentElement.dir = 'ltr';
            document.body.classList.remove('rtl');
        }
    }
}

// Initialize i18n when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    window.i18n = new I18n();
}); 