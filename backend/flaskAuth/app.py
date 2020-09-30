import os
from dotenv import load_dotenv
from flask import Flask, request, make_response, jsonify, session, abort
from flask_sqlalchemy import SQLAlchemy
import hmac
from hashlib import sha1
from flask_wtf.csrf import CsrfProtect, safe_str_cmp
import json
import secrets
from passlib.hash import sha256_crypt

app = Flask(__name__)
app.debug = True
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

app.config['DEBUG'] = False
app.secret_key = 'a029i384hersdnfsmdosqwij928ue3r74t5hy6udngtrmdoefzwijpe9a28e3w4'
app.config['SQLALCHEMY_DATABASE_URI'] = \
    f"{os.getenv('DMS')}+{os.getenv('DRIVER')}://{os.getenv('POSTGRES_USER')}:\
{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:\
{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"

db = SQLAlchemy(app)


class User(db.Model):
    # __tablename__ = 'user'
    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    family = db.Column(db.String(35), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    patronymic = db.Column(db.String(40), nullable=False)
    age = db.Column(db.Integer(), nullable=False)
    login = db.Column(db.String(30), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=True)
    password = db.Column(db.String(200), nullable=False)


db.init_app(app)
db.create_all()


@app.before_request
def check_csrf_token():
    if request.method in ("GET",):
        return
    elif request.path == '/csrf':
        return
    token = request.get_json()['CSRFtoken']
    if token is None:
        abort(400, {'message': 'Отсутствует CSRF-token'})
    if not safe_str_cmp(
            csrf_token(bytes(token, encoding='utf-8')),
            csrf_token(session['_csrf_token'])):
        abort(400, {'message': 'Некорректный CSRF-token'})


@app.route('/cookie', methods=['POST'])
def cookie_auth():
    def delete_cookie():
        response = make_response({'message': 'Некорректные куки'})
        response.set_cookie('user_id', 'a', max_age=0)
        response.set_cookie('login', 'a', max_age=0)
        response.set_cookie('user_auth', 'a', max_age=0)
        return response

    if not request.cookies.get('user_id') or \
            not request.cookies.get('login') or \
            not request.cookies.get('user_auth'):
        return jsonify({'message': 'Нет нужного куки'}), 404
    else:
        user_id = request.cookies.get('user_id')
        login = request.cookies.get('login')
        user_auth = request.cookies.get('user_auth')
        query_user = User.query.filter_by(id=user_id, login=login).first()
        if query_user is None:
            resp = delete_cookie()
            return resp, 404
        else:
            user = query_user
            hashable = f'authorized{user.id}{user.login}{user.password}'
            if sha256_crypt.verify(hashable, user_auth):
                return jsonify({'message': 'Успех'}), 200
            else:
                resp = delete_cookie()
                return resp, 403


@app.route('/csrf', methods=['GET'])
def csrf_simple():
    if '_csrf_token' not in session:
        session['_csrf_token'] = bytes(secrets.token_hex(128), encoding='utf-8')
        session.modified = True
    return jsonify({'token': bytes.decode(session['_csrf_token'], 'utf-8')}), 200


def csrf_token(simple_token):
    if '_csrf_token' not in session:
        session['_csrf_token'] = bytes(secrets.token_hex(128), encoding='utf-8')
        session.modified = True
        simple_token = session['_csrf_token']
    return hmac.new(bytes(app.secret_key, 'utf-8'),
                    simple_token,
                    digestmod=sha1).hexdigest()


@app.route('/register', methods=['POST'])
def register_user():
    register_data = request.data
    reg_data = json.loads(register_data)
    # query_logins = User.query.with_entities(User.login).all()
    logins = User.query.filter_by(login=reg_data['login']).all()
    if len(logins) != 0:
        return jsonify({'message': 'Пользователь с таким логином уже существует'}), 409
    emails = User.query.filter_by(email=reg_data['email']).all()
    if len(emails) != 0:
        return jsonify({'message': 'пользователь с таким email уже существует'}), 409
    user = User(
        family=reg_data['lastName'],
        name=reg_data['firstName'],
        patronymic=reg_data['patronymic'],
        age=reg_data['age'],
        login=reg_data['login'],
        email=reg_data['email'],
        password=sha256_crypt.hash(reg_data['password'])
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'Регистрация прошла успешно'}), 201


@app.route('/authorize', methods=['POST'])
def authorize():
    user_data = request.data
    data = json.loads(user_data)
    query_user = User.query.filter_by(login=data['login']).all()
    if len(query_user) == 0:
        return jsonify({'message': 'Пользователя с таким логином не существует!'}), 404
    elif len(query_user) != 1:
        return jsonify({'message': 'Внутренняя ошибка сервера'}), 500
    else:
        password = data['password']
        user = query_user[0]
        if not sha256_crypt.verify(password, user.password):
            return jsonify({'message': 'Неправильный пароль!'}), 403
        else:
            response = make_response(jsonify({'message': 'Успешная авторизация!'}))
            response.set_cookie('user_id', str(user.id), 60 * 60 * 2)
            response.set_cookie('login', user.login, 60 * 60 * 2)
            response.set_cookie('user_auth',
                                sha256_crypt.hash(f'authorized{user.id}{user.login}{user.password}'),
                                60 * 60 * 2)
            return response, 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
