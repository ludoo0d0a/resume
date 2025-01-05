const fs = require('fs');
const gravatar = require('gravatar');
const Mustache = require('mustache');
const emojiFlags = require('emoji-flags');

const DEFAULT_LOCALE = 'en-US'
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

function render(resumeObject) {
    const locale = (resumeObject.meta && resumeObject.meta.locale) || DEFAULT_LOCALE;
    const i18n = allI18ns[locale] || allI18ns[DEFAULT_LOCALE];

    const dateTranslate = (translate) => {
        return new Intl.DisplayNames(locale, { type: 'dateTimeField' }).of(translate);
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
            parts.push(years+' '+dateTranslate('year')+((years>1)?'s':''));
        }
        if (months > 0) {
            parts.push(months+' '+dateTranslate('month')+((months>1)?'s':''));
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
        return !!(r && r.length && (name ? r[0][name] : r))
    }

    //all titles for i18n
    resumeObject.titles = i18n.titles;

    resumeObject.basics.capitalName = resumeObject.basics.name.toUpperCase();

    if(resumeObject.basics && resumeObject.basics.email) {
        resumeObject.basics.gravatar = gravatar.url(resumeObject.basics.email, {
                        s: '200',
                        r: 'pg',
                        d: 'mm'
                    });
    }
    if (resumeObject.basics.image || resumeObject.basics.gravatar) {
        resumeObject.photo = resumeObject.basics.image ? resumeObject.basics.image : resumeObject.basics.gravatar;
    }

    var profiles = [...resumeObject.basics.profiles];

    profiles.forEach(p => {
        const icons = p.network.toLowerCase().split('::')
        const icon = icons[0]
        var text = (icons.length > 1) ? icons[icons.length-1] : ''
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
                p.link = true;
                break;
            case "flag":
                const lang = (icons.length > 1) ? icons[1] : ''
                iconClass = 'fa fa-flag' + (lang ? ` fa-flag-${lang}` : '');
                text = p.username + ' ' + emojiFlags.countryCode(lang).emoji;
                p.link = true;
                break;
            default:
                // try to automatically select the icon based on the name
                iconClass = `fab fa-${p.network.toLowerCase()}`;
        }

        //p.text = (p.url) ? p.url : `${p.network}: ${p.username}`;
        p.text = text || p.network
        p.iconClass  = iconClass
    });

    resumeObject.basics.profiles = profiles.filter(p => !p.link);
    resumeObject.basics.links = profiles.filter(p => p.link);

    function formatSection(w) {
        if (w.startDate) {
            w.startDateText = formatDate(w.startDate)
        }
        w.endDateText = (w.endDate) ? formatDate(w.endDate) :  i18n.present
        w.duration = formatDuration(w.startDate, w.endDate)
        w.boolHighlights = isFirst(w.highlights)
    }

    if (resumeObject.work && resumeObject.work.length) {
        resumeObject.workBool = true;
        resumeObject.work.forEach(w => formatSection(w));
    }

    if (resumeObject.volunteer && resumeObject.volunteer.length) {
        resumeObject.volunteerBool = true;
        resumeObject.volunteer.forEach(w => formatSection(w));
    }


    resumeObject.projectsBool = isFirst(resumeObject.projects , 'name')

    if (isFirst(resumeObject.education , 'institution')) {
        resumeObject.educationBool = true;
        resumeObject.education.forEach(e => {
            formatSection(e);
            e.educationDetail = [e.area, e.studyType].filter(Boolean).join(', ');
            e.educationCourses = isFirst(e.courses)
            const startYear = parseDateYear(e.startDate)
            const endYear = parseDateYear(e.endDate)
            e.dateText = `${startYear} ${endYear}`
        });
    }

    if (isFirst(resumeObject.awards , 'title')) {
        resumeObject.awardsBool = true;
        resumeObject.awards.forEach(a => {
            a.dateText = formatDate(a.date)
        });
    }

    if (isFirst(resumeObject.publications , 'name')) {
        resumeObject.publicationsBool = true;
        resumeObject.publications.forEach(p => {
            p.dateText = formatDateDMY(p.releaseDate)
        });
    }

    resumeObject.skillsBool = isFirst(resumeObject.skills , 'name')
    resumeObject.interestsBool = isFirst(resumeObject.interests, 'name')
    resumeObject.languagesBool = isFirst(resumeObject.languages, 'language')
    resumeObject.referencesBool = isFirst(resumeObject.references, 'name')

    resumeObject.css = fs.readFileSync(__dirname + "/style.css", "utf-8");
    resumeObject.printcss = fs.readFileSync(__dirname + "/print.css", "utf-8");
    var theme = fs.readFileSync(__dirname + '/resume.template', 'utf8');
    return Mustache.render(theme, resumeObject);
}



module.exports = {
    render: render
}
