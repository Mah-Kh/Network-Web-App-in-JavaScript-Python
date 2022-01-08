from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django import forms
from django.forms import ModelForm
from django.core.paginator import Paginator
import sys, json
from django.http import JsonResponse
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
import requests


from .models import User, Profile, Post

        
@csrf_exempt
@login_required
def post(request):
    if request.method == "POST":
        user = request.user
        if user.is_authenticated:
            data = json.loads(request.body)
            
            post = data.get("post", "")
            
            newpost = Post(
                user=request.user,
                post=post
            )
            newpost.save()
            
            return JsonResponse(newpost.serialize())
         

@csrf_exempt
@login_required
def edit(request, post_id):
    post = Post.objects.get(pk=post_id)
    post_user = post.user
        
    if request.method == "POST":
        if post_user != request.user:
            return HttpResponseRedirect(reverse("network:index"))
        else:
            data = json.loads(request.body)
            edited_post = data.get("post", "")
        
            editpost = Post.objects.get(
                user=request.user,
                id=post_id
            )
        
            editpost.post = edited_post        
            editpost.save()
       
            return JsonResponse(editpost.serialize())
    
    if request.method == "GET":
        if post_user != request.user:
            return HttpResponseRedirect(reverse("network:index"))
        else:
            return JsonResponse(post.serialize())


@login_required
def like(request, post_id):
    addlike = Post.objects.get(
        id=post_id
    )  
    addlike.like += 1 
    addlike.save()
        
    return JsonResponse({"message": "like"}, status=201)
 

@login_required
def unlike(request, post_id):
    removelike = Post.objects.get(
        id=post_id
    )  
    removelike.like -= 1 
    removelike.save()
        
    return JsonResponse({"message": "unlike"}, status=201)

@login_required
def follow(request, user_profile): 
    user = request.user
    following_user = User.objects.get(username=user_profile)              
    profile_following = Profile.objects.get(user=following_user)
    profile_following.follower.add(user) 
    active_profile = Profile.objects.get(user=user)
    active_profile.following.add(following_user)

    profile_following.follower_num += 1 
    active_profile.following_num += 1

    profile_following.save()
    active_profile.save()
        
    return JsonResponse({"message": "follow"}, status=201)
 

@login_required
def unfollow(request, user_profile):
    user = request.user
    following_user = User.objects.get(username=user_profile)              
    profile_following = Profile.objects.get(user=following_user)
    profile_following.follower.remove(user)
    active_profile = Profile.objects.get(user=user)
    active_profile.following.remove(following_user)
    profile_following.follower_num -= 1 
    active_profile.following_num -= 1

    profile_following.save()
    active_profile.save()
        
    return JsonResponse({"message": "unfollow"}, status=201)

def index(request):  
    posts_list = Post.objects.all().order_by('-timestamp')        
    
    paginator = Paginator(posts_list, 10) 
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
        
    return render(request, "network/index.html", {
        "page_obj": page_obj
    })
   
        
def all_posts(request):
    posts_list = Post.objects.all().order_by('-timestamp')        
    
    paginator = Paginator(posts_list, 10) 
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
        
    return render(request, "network/posts.html", {
        "page_obj": page_obj
    })

def following(request):
    user = request.user 
    user_following = Profile.objects.get(user=user)
    followings = user_following.following.all()
    
    all_posts = Post.objects.all().order_by('-timestamp') 
    following_posts = []
    for i in range(len(all_posts)):
        for j in range(len(followings)):
            if all_posts[i].user == followings[j]:
                following_posts.append(all_posts[i])

    paginator = Paginator(following_posts, 10) 
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
        
    return render(request, "network/following.html", {
        "page_obj": page_obj
    })


def profile(request, user_profile):                   
    if request.method == "GET":       
        user = request.user 
        if user.is_authenticated:
            user = request.user 
            others = User.objects.all()       
            profile = User.objects.get(username=user_profile)
            current_user = Profile.objects.get(user=user)
            followers_k = Profile.objects.get(user=profile)
            followers = followers_k.follower.all()
            followings = followers_k.following.all()
 
            profile_username = User.objects.get(username=user_profile)
            user_posts = Post.objects.filter(user=profile_username).order_by('-timestamp')
      
            paginator = Paginator(user_posts, 10) 

            page_number = request.GET.get('page')
            page_obj = paginator.get_page(page_number)


            if profile != user:               
                if Profile.objects.filter(user=profile, follower=user).exists():
                    return render(request, "network/profile.html", {
                        "profile_name": profile,
                        "profile": followers_k,
                        "followers": followers,
                        "followings": followings,
                        "follower": user,
                        "page_obj": page_obj
                    })
                else:
                    return render(request, "network/profile.html", {
                        "profile_name": profile,
                        "profile": followers_k,
                        "followers": followers,
                        "followings": followings,
                        "others": others,
                        "page_obj": page_obj
                    })
            else:
                return render(request, "network/profile.html", {
                    "profile_name": user,
                    "profile": current_user,
                    "followers": followers,
                    "followings": followings,
                    "page_obj": page_obj
                })
        else:            
            return render(request, "network/login.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("network:index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("network:index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save() 
            
            users_number = Profile.objects.all()
            admin = User.objects.get(username="admin")
            isAdminExist = 0
            for i in range(len(users_number)):
                if users_number[i].user.username == admin.username:
                    isAdminExist = 1
            if isAdminExist == 0:
                adminprofile = Profile()
                adminprofile.user = admin
                adminprofile.save()

            
            createprofile = Profile()
            createprofile.user = user
            createprofile.save()
    
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("network:index"))
    else:
        return render(request, "network/register.html")
                            
                            
