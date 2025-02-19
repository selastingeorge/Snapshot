from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from flask_cors import CORS
import uuid  # For unique filenames

app = Flask(__name__)
CORS(app)  # Enable CORS for Angular requests

DATABASE = 'presets.db'
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Allowed file check
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize the SQLite database
def init_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS presets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_url TEXT NOT NULL,
                x1 INTEGER,
                x2 INTEGER,
                y1 INTEGER,
                y2 INTEGER,
                website_url TEXT UNIQUE,  -- Ensure website_url is unique
                date TEXT
            )
        ''')
        conn.commit()

@app.route('/presets', methods=['GET', 'POST'])
def presets():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # To return data as dictionaries
    cursor = conn.cursor()

    if request.method == 'POST':
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        image = request.files['image']
        website_url = request.form.get('website_url')

        # Check if website_url already exists
        cursor.execute('SELECT * FROM presets WHERE website_url = ?', (website_url,))
        existing_preset = cursor.fetchone()

        if existing_preset:
            conn.close()
            return jsonify({'error': 'Website URL already exists.'}), 409  # Conflict

        if image and allowed_file(image.filename):
            # Generate a unique filename using UUID
            file_ext = image.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            image.save(image_path)

            # Other form data
            x1 = request.form.get('x1')
            x2 = request.form.get('x2')
            y1 = request.form.get('y1')
            y2 = request.form.get('y2')
            date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            # Insert into the database
            cursor.execute('''
                INSERT INTO presets (image_url, x1, x2, y1, y2, website_url, date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (image_path, x1, x2, y1, y2, website_url, date))

            conn.commit()
            conn.close()
            return jsonify({'message': 'Preset saved successfully!', 'image_path': image_path}), 201

        return jsonify({'error': 'Invalid file format'}), 400

    elif request.method == 'GET':
        cursor.execute('SELECT * FROM presets')
        presets_data = cursor.fetchall()
        conn.close()
        return jsonify([dict(preset) for preset in presets_data]), 200

@app.route('/presets/<int:preset_id>', methods=['DELETE'])
def delete_preset(preset_id):
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()

        # Check if the preset exists
        cursor.execute('SELECT * FROM presets WHERE id = ?', (preset_id,))
        preset = cursor.fetchone()

        if preset is None:
            conn.close()
            return jsonify({'error': 'Preset not found'}), 404

        # Delete the associated image file
        image_path = preset[1]  # image_url column is at index 1
        if os.path.exists(image_path):
            os.remove(image_path)

        # Delete the preset from the database
        cursor.execute('DELETE FROM presets WHERE id = ?', (preset_id,))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Preset deleted successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/presets/<int:preset_id>', methods=['GET'])
def get_preset(preset_id):
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM presets WHERE id = ?', (preset_id,))
    preset = cursor.fetchone()
    conn.close()
    if preset:
        return jsonify(dict(preset)), 200
    return jsonify({'error': 'Preset not found'}), 404

@app.route('/presets/<int:preset_id>', methods=['PUT'])
def update_preset(preset_id):
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        data = request.json
        cursor.execute('SELECT * FROM presets WHERE id = ?', (preset_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Preset not found'}), 404

        cursor.execute('''
            UPDATE presets SET x1 = ?, x2 = ?, y1 = ?, y2 = ?, website_url = ?, date = ? WHERE id = ?
        ''', (data['x1'], data['x2'], data['y1'], data['y2'], data['website_url'],
              datetime.now().strftime('%Y-%m-%d %H:%M:%S'), preset_id))

        conn.commit()
        conn.close()
        return jsonify({'message': 'Preset updated successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<path:filename>', methods=['GET'])
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/scan-checkup', methods=['post'])
def scan_checkup():
    scan_dir_exists = False

    # Check screenshots directory exists or not
    scan_dir = request.form.get('scan_directory')
    exists = os.path.exists(scan_dir) and os.path.isdir(scan_dir)
    if exists:
        scan_dir_exists = True

    




if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5102)
