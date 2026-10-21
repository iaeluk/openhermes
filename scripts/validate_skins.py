"""Validate openhermes skins: required keys, hex format, name matches file."""
import os
import re
import sys

REQUIRED = [
    'background', 'ui_text', 'ui_primary', 'ui_accent', 'ui_border',
    'ui_label', 'ui_ok', 'ui_warn', 'ui_error', 'ui_tool', 'ui_thinking',
    'banner_border', 'banner_title', 'banner_accent', 'banner_dim',
    'banner_text', 'prompt', 'input_rule', 'response_border',
    'shell_dollar', 'selection_bg', 'session_label', 'session_border',
    'status_bar_bg', 'status_bar_text', 'status_bar_strong',
    'status_bar_dim', 'status_bar_good', 'status_bar_warn',
    'status_bar_bad', 'status_bar_critical', 'voice_status_bg',
    'completion_menu_bg', 'completion_menu_current_bg',
    'completion_menu_meta_bg', 'completion_menu_meta_current_bg',
    'diff_added', 'diff_removed', 'diff_added_word', 'diff_removed_word',
    'syntax_string', 'syntax_number', 'syntax_keyword', 'syntax_comment',
]
HEX = re.compile(r'^#[0-9a-fA-F]{6}$')


def parse(path):
    data, section = {}, None
    with open(path) as f:
        for line in f:
            line = line.rstrip('\n')
            if not line.strip() or line.startswith('#'):
                continue
            if not line.startswith((' ', '\t')):
                k, _, v = line.partition(':')
                section = k.strip()
                data[section] = v.strip() if v.strip() else {}
            else:
                k, _, v = line.strip().partition(':')
                v = v.strip().strip('"').strip("'")
                if isinstance(data.get(section), dict):
                    data[section][k.strip()] = v
    return data


def main(d):
    files = sorted(f for f in os.listdir(d) if f.endswith('.yaml'))
    errors, count = [], 0
    for f in files:
        p = os.path.join(d, f)
        try:
            data = parse(p)
        except Exception as e:  # noqa: BLE001
            errors.append('%s: parse: %s' % (f, e))
            continue
        if data.get('name') != f[:-5]:
            errors.append('%s: name mismatch (%s)' % (f, data.get('name')))
        colors = data.get('colors', {})
        for k in REQUIRED:
            if k not in colors:
                errors.append('%s: missing %s' % (f, k))
            elif not HEX.match(colors[k]):
                errors.append('%s: bad hex %s=%s' % (f, k, colors[k]))
        count += 1
    print('skins: %d, errors: %d' % (count, len(errors)))
    for e in errors:
        print(' ', e)
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else 'themes'))
