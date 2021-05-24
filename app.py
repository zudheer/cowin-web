from flask import Flask
from flask import render_template
from flask import request
# from flask_mysqldb import MySQL


app = Flask(__name__, template_folder='template', static_folder='')
# app.config['MYSQL_HOST'] = 'vaccinefinder.cjz1fs3cqewu.ap-south-1.rds.amazonaws.com'
# app.config['MYSQL_USER'] = 'root'
# app.config['MYSQL_PASSWORD'] = 'PqYSjDMb5H8'  # Move to env variables
# app.config['MYSQL_DB'] = 'vaccinefinder'
# mysql = MySQL(app)


@app.route('/')
def index():
    return render_template('index.html')


# @app.route('/register', methods=['POST'])
# def register():
#     phone = request.form['phone']
#     pincode = request.form['pincode']
#     cur = mysql.connection.cursor()
#     cur.execute("INSERT INTO user(phone, pincode) VALUES (%s, %s)", (phone, pincode))
#     mysql.connection.commit()
#     cur.close()
#     return {'status': 200}


if __name__ == "__main__":
        app.run()
