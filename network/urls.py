
from django.urls import path

from . import views

app_name ="network"

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("all", views.all_posts, name="all_posts"),
    path("profile/<str:user_profile>", views.profile, name="user"),
    path("following", views.following, name="following"),
    path("edit/<post_id>", views.edit, name="edit"),
    
    
    # API Route
    path("post", views.post, name="post"),
    path("post/<int:post_id>", views.edit, name="edit"),
    path("like/<int:post_id>", views.like, name="like"),
    path("unlike/<int:post_id>", views.unlike, name="unlike"),
    path("follow/<str:user_profile>", views.follow, name="follow"),
    path("unfollow/<str:user_profile>", views.unfollow, name="unfollow"),
]
