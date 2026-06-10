from flask import Flask, request, jsonify, render_template
import json
import os

app = Flask(__name__)

RULES_FILE = 'rules.txt'

def load_rules_from_file():
    if os.path.exists(RULES_FILE):
        try:
            with open(RULES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []

def save_rules_to_file(rules):
    with open(RULES_FILE, 'w', encoding='utf-8') as f:
        json.dump(rules, f, ensure_ascii=False)

rules = load_rules_from_file()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/rules')
def rules_page():
    return render_template('rules.html')

@app.route('/highlight', methods=['POST'])
def highlight():
    data = request.get_json()
    text = data.get('text', '')
    
    import re
    
    highlighted_text = text
    matches = []
    match_id = 0
    matched_ranges = []
    
    all_patterns = []
    for rule in rules:
        if rule.get('text'):
            texts = rule['text'].split('、')
            for t in texts:
                if t.strip():
                    all_patterns.append({
                        'text': t.strip(),
                        'color': rule['color']
                    })
    
    all_patterns.sort(key=lambda x: -len(x['text']))
    
    for pattern in all_patterns:
        p = re.escape(pattern['text'])
        for match in re.finditer(p, text):
            is_overlapping = False
            for mr in matched_ranges:
                if not (match.end() <= mr['start'] or match.start() >= mr['end']):
                    is_overlapping = True
                    break
            if not is_overlapping:
                matches.append({
                    'start': match.start(),
                    'end': match.end(),
                    'text': pattern['text'],
                    'color': pattern['color'],
                    'id': match_id
                })
                matched_ranges.append({'start': match.start(), 'end': match.end()})
                match_id += 1
    
    matches.sort(key=lambda x: -x['start'])
    
    for match in matches:
        highlighted_text = highlighted_text[:match['start']] + f'<span style="color: {match["color"]};">{match["text"]}</span>' + highlighted_text[match['end']:]
    
    return jsonify({'result': highlighted_text})

@app.route('/api/rules', methods=['GET'])
def get_rules():
    return jsonify(rules)

@app.route('/api/rules', methods=['POST'])
def save_rules():
    global rules
    data = request.get_json()
    rules = data
    save_rules_to_file(rules)
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')