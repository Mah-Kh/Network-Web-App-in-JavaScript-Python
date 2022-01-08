from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass


class Profile(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="profile")
    posts = models.IntegerField(blank=True, null=True, default=0)
    follower_num = models.IntegerField(blank=True, null=True, default=0)
    following_num = models.IntegerField(blank=True, null=True, default=0)
    
    follower = models.ManyToManyField("User", related_name="followers", symmetrical=False)
    following = models.ManyToManyField("User", related_name="followings", symmetrical=False)   
    
    def __str__(self):
        return f"{self.user}"

class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts_users")
    post = models.TextField(null=True,blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    like = models.IntegerField(blank=True, null=True, default=0)
    
    class Meta:
        ordering = ['-timestamp',]
    
    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "post": self.post,
            "like": self.like,
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
            #"timestamp": self.timestamp.strftime("%b %#d %Y, %#I:%M %p"),
        }


    
 