import styleCSS from './style.js';
import printCSS from './print.js';
import theme from './resume.template.js';
import gravatar from 'gravatar';
import Handlebars from 'handlebars';
import emojiFlags from 'emoji-flags';

const DEFAULT_LOCALE = 'en-US'
const DEFAULT_LANG = 'en'
const allI18ns= {
    'en-US': {
        present: 'Present',
        expected: ' (i18n.expected)',
        titles:{
            maintitle: `Resume of `,
            contact: 'Contact',
            about: 'About',
            work: 'Work Experience',
            volunteer: 'Volunteer',
            projects: 'Projects',
            highlights: 'Highlights',
            awards: 'Awards',
            education: 'Education',
            skills: 'skills',
            publications: 'Publications',
            languages: 'Languages',
            interests: 'Interests',
            references: 'References'
        }

    },
    'fr-FR': {
        present: "Aujourd'hui",
        expected: " (attendu)",
        titles:{
            maintitle: `CV de `,
            about: 'A propos',
            contact: 'Contact',
            work: 'Expériences',
            volunteer: 'Volontariat',
            projects: 'Projets',
            highlights: 'Résumé',
            awards: 'Récompenses',
            education: 'Ecoles',
            skills: 'Compétences',
            publications: 'Publications',
            languages: 'Langues',
            interests: "Centre d'intérêts",
            references: 'Références'
        }
    }
}


function render(resume) {
    const locale = (resume.meta && resume.meta.locale) || DEFAULT_LOCALE;
    const lang = locale.split('-')[0] || DEFAULT_LANG;
    resume.lang = lang;
    const i18n = allI18ns[locale] || allI18ns[DEFAULT_LOCALE];

    function plural(items, name) {
        let text = dateTranslate(name)
        if (items>1 && !text.endsWith('s')) {
            text +='s'
        }
        return items + ' ' + text;
    }

    const dateTranslate = (name) => {
        return new Intl.DisplayNames(locale, { type: 'dateTimeField' }).of(name);
    }

    function formatDuration(startDate, endDate) {
        if (!startDate)
            return '';

        const start = parseDate(startDate);
        const end = endDate ? parseDate(endDate) : new Date();

        // Get difference in milliseconds
        const diffMs = end - start;

        // Convert to years and months
        const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
        const months = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        const parts = [];
        if (years > 0) {
            parts.push(plural(years, 'year'));
        }
        if (months > 0) {
            parts.push(plural(months, 'month'));
        }
        return parts.join(', ');
    }

    function parseDateYear(dateText) {
        if (!dateText)
            return '';
        const d = parseDate(dateText);
        return d.getFullYear();
    }
    function parseDate(dateText) {
        return new Date(dateText);
    }

    function formatDateDMY(dateText){
        return parseFormatDate(dateText, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatDate(dateText) {
        return parseFormatDate(dateText, {
            year: 'numeric',
            month: 'long'
        });
    }

    function parseFormatDate(dateText, options) {
        const d = parseDate(dateText)
        return new Intl.DateTimeFormat(locale, options).format(d);
    }

    function isFirst(r, name) {
        return !!(r && r.length && (name ? r[0][name] : r[0]))
    }

    //all titles for i18n
    resume.titles = i18n.titles;

    resume.basics.capitalName = resume.basics.name.toUpperCase();

    if(resume.basics && resume.basics.email) {
        resume.basics.gravatar = gravatar.url(resume.basics.email, {
                        s: '200',
                        r: 'pg',
                        d: 'mm'
                    });
    }
    if (resume.basics.image || resume.basics.gravatar) {
        resume.photo = resume.basics.image ? resume.basics.image : resume.basics.gravatar;
    }

    var profiles = [...resume.basics.profiles];

    function emoji(country) {
        try {
            const cc = emojiFlags.countryCode(country)
            if (!cc)
                throw new Error(`No emoji for [${country}] ; be careful it should be country, not lang => us, not en` )
            return cc.emoji
        } catch (e) {
            console.error(e);
            return "";
        }
    }

    profiles.forEach(p => {
        const icons = p.network.toLowerCase().split('::')
        const icon = icons[0]
        const plang = (icons.length > 1) ? icons[1] : ''

        var text = ''
        var iconClass = ''

        switch (icon) {
            // special cases
            case "google-plus":
            case "googleplus":
                iconClass = "fab fa-google-plus";
                break;
            case "flickr":
            case "flicker":
                iconClass = "fab fa-flickr";
                break;
            case "dribbble":
            case "dribble":
                iconClass = "fab fa-dribbble";
                break;
            case "codepen":
                iconClass = "fab fa-codepen";
                break;
            case "soundcloud":
                iconClass = "fab fa-soundcloud";
                break;
            case "reddit":
                iconClass = "fab fa-reddit";
                break;
            case "tumblr":
            case "tumbler":
                iconClass = "fab fa-tumblr";
                break;
            case "stack-overflow":
            case "stackoverflow":
                iconClass = "fab fa-stack-overflow";
                break;
            case "blog":
            case "rss":
                iconClass = "fas fa-rss";
                break;
            case "gitlab":
                iconClass = "fab fa-gitlab";
                break;
            case "keybase":
                iconClass = "fas fa-key";
                break;
            case "pdf":
            case "doc":
            case "document":
            case "cv":
            case "resume":
                iconClass = "fas fa-file-pdf";
                text = p.username
                p.type = 'link';
                break;
            case "translation":
                text = emoji(plang)
                p.arialabel = p.username
                p.type = 'translations';
                break;
            default:
                // try to automatically select the icon based on the name
                iconClass = `fab fa-${icon}`;
        }

        p.text = text || p.network
        p.iconClass  = iconClass
    });

    resume.basics.profiles = profiles.filter(p => !p.type);
    resume.basics.links = profiles.filter(p => p.type==='link');
    resume.basics.translations = profiles.filter(p => p.type==='translations');

    resume.basics.translationsBool = isFirst(resume.basics.translations)

    function formatSection(w) {
        if (w.startDate) {
            w.startDateText = formatDate(w.startDate)
        }
        w.endDateText = (w.endDate) ? formatDate(w.endDate) :  i18n.present
        w.duration = formatDuration(w.startDate, w.endDate)
        w.boolHighlights = isFirst(w.highlights)
    }

    if (resume.work && resume.work.length) {
        resume.workBool = true;
        resume.work.forEach(w => formatSection(w));
    }

    if (resume.volunteer && resume.volunteer.length) {
        resume.volunteerBool = true;
        resume.volunteer.forEach(w => formatSection(w));
    }


    resume.projectsBool = isFirst(resume.projects , 'name')

    if (isFirst(resume.education , 'institution')) {
        resume.educationBool = true;
        resume.education.forEach(e => {
            formatSection(e);
            e.educationDetail = [e.area, e.studyType].filter(Boolean).join(', ');
            e.educationCourses = isFirst(e.courses)
            const startYear = parseDateYear(e.startDate)
            const endYear = parseDateYear(e.endDate)
            e.dateText = `${startYear} ${endYear}`
        });
    }

    if (isFirst(resume.awards , 'title')) {
        resume.awardsBool = true;
        resume.awards.forEach(a => {
            a.dateText = formatDate(a.date)
        });
    }

    if (isFirst(resume.publications , 'name')) {
        resume.publicationsBool = true;
        resume.publications.forEach(p => {
            p.dateText = formatDateDMY(p.releaseDate)
        });
    }

    resume.skillsBool = isFirst(resume.skills , 'name')
    resume.interestsBool = isFirst(resume.interests, 'name')
    resume.languagesBool = isFirst(resume.languages, 'language')
    resume.referencesBool = isFirst(resume.references, 'name')

    resume.css = styleCSS;
    resume.printcss = printCSS;
    return Handlebars.compile(theme)({
      css: styleCSS,
      printcss: printCSS,
      resume: resume
    });
}



export { render };
export default { render };
