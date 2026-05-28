# Europass XML Schema (v3.4.0)

Official Cedefop URLs (`http://europass.cedefop.europa.eu/xml/v3.4.0/*.xsd`) no longer serve XSD files (they redirect to the Europass website). These files are vendored from the [europass/ewa-cedefop](https://github.com/europass/ewa-cedefop) repository:

`services/core/src/main/resources/schema/v3.4.0/`

## Layout

- `v3.4.0/EuropassSchema.xsd` — root schema (`SkillsPassport`)
- `v3.4.0/*.xsd` — component schemata (learner info, printing preferences, etc.)
- `v3.4.0/included/` — ISO countries, languages, nationalities, address formats

## Refresh

```bash
npm run xsd
```

After download, `included/` and `imported/` paths are wired for offline use (official URLs no longer serve XSD).

## Validate generated XML

```bash
npm run build -- --preset europass-xml   # build + validate
npm run validate                         # validate existing files only
```

## License

Schema files are licensed under the [EUPL-1.1](https://joinup.ec.europa.eu/software/page/eupl/licence-eupl) (see file headers). Source: European Union / Cedefop Europass project.

## Reference

- [Europass XML Schema documentation v3.4.0 (PDF)](https://europass.europa.eu/system/files/2020-07/europass-xml-schema-doc-v3.4.0_0.pdf)
