#!/usr/bin/env python
import webapp2
import jinja2, os
import logging

from google.appengine.api import users
from google.appengine.ext import db

def nocheating(response):
    response.headers.add_header("X-JSWarrior-NoCheating1", "If you are trying to inspect HTTP Headers to submit invalid results, just note that we validate all code before giving out cookies")
    response.headers.add_header("X-JSWarrior-NoCheating2", "But if you like this kind of stuff, why not consider working with us?")
    response.headers.add_header("X-JSWarrior-NoCheating3", "Lots more cookies and even more fun people at our office. fusioncharts.com/careers")

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__) + '/templates'),
    extensions=['jinja2.ext.autoescape'])

class Submission (db.Model):
    level = db.IntegerProperty()
    user = db.UserProperty(required=True, auto_current_user=True)
    code = db.TextProperty()
    submission_time = db.DateTimeProperty(required=True,auto_now=True)

def get_default_template_values (requireLogin):
    user = users.get_current_user()

    template_values = {}

    if user:
        template_values['loggedIn'] = True
        template_values['logoutUrl'] = users.create_logout_url("/")
        template_values['nickName'] = user.nickname()
    else:
        template_values['loggedIn'] = False
        template_values['loginUrl'] = users.create_login_url("/")

    if requireLogin and not template_values['loggedIn']:
        raise Exception("You need to be logged in to do this")

    return template_values

def validate_level (levelId):
    ilevel = int(levelId)
    if ilevel <= 0 or ilevel >= 8:
        raise Exception ("Invalid level id")

class MainHandler(webapp2.RequestHandler):
    def get(self):
        nocheating(self.response)
        template_values = get_default_template_values(False)
        template_values['startGameUrl'] = users.create_login_url("/level/1")

        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(template_values))

class CompleteHandler (webapp2.RequestHandler):
    def post(self, levelid):
        nocheating(self.response)
        validate_level (levelid)
        logging.debug("Marking coplete ", levelid)
        nextlevel = "" + str(int(levelid) + 1)

        # Write the submission to the database
        # First, check if the user has already submitted for this level
        sub = Submission()
        sub.level = int(levelid)

        sq = Submission.all()
        sq.filter('user = ', users.get_current_user())
        sq.filter('level = ', int(levelid))
        sqres = sq.fetch(limit=5)
        if len(sqres) > 0:
            logging.info("Found an existing submission")
            sub = sqres[0]

        sub.code = self.request.get('code', '')
        sub.put()

        self.response.write ("/level/" + nextlevel)

class LevelHandler (webapp2.RequestHandler):
    def get(self, levelId):
        nocheating(self.response)
        validate_level (levelId)
        template_values = get_default_template_values(True)
        template_values['levelId'] = int(levelId)

        sq = Submission.all()
        sq.filter('user =', users.get_current_user())
        sq.filter('level =', int(levelId))
        sqres = sq.fetch(limit=5)
        if len(sqres) > 0:
            sub = sqres[0]
            template_values['code'] = sub.code
        else:
            sq = Submission.all()
            sq.filter('user =', users.get_current_user())
            sq.filter('level =', int(levelId) - 1)
            sqres = sq.fetch(limit=5)

            if len(sqres) > 0:
                template_values['code'] = sqres[0].code

        template_values['hintFile'] = "hints/hint%d.html" % int(levelId)
        template = JINJA_ENVIRONMENT.get_template('level.html')
        self.response.write(template.render(template_values))

app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/complete/(.*)', CompleteHandler),
    ('/level/(.*)', LevelHandler),
], debug=True)
