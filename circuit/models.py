
from django.db import models


class Circuit(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    title = models.CharField(blank=True, max_length=64)
    nots = models.TextField(blank=True)

    def serialize(self):
        return{
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
            "title": self.title,
            "nots": self.nots
        }