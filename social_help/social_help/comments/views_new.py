from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.conf import settings

from .serializers import CommentSerializer
from .models import Comment, ModerationSetting, InstagramAccount
from .instagram_service import InstagramService

import secrets
import requests


# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------

def get_settings(user=None):
    if user:
        obj, _ = ModerationSetting.objects.get_or_create(user=user)
        return obj
    obj, _ = ModerationSetting.objects.get_or_create(id=1)
    return obj


# -------------------------------------------------------------------
# Landing Page
# -------------------------------------------------------------------

def landing(request):
    """Landing page for unauthenticated users"""
    if request.user.is_authenticated:
        return redirect("/dashboard/")
    return render(request, "landing.html")


# -------------------------------------------------------------------
# Auth / Dashboard
# -------------------------------------------------------------------

@login_required
def dashboard(request):
    account = InstagramAccount.objects.filter(user=request.user).first()
    return render(request, "comments/dashboard.html", {
        "account": account,
    })


def signup(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("/dashboard/")
    else:
        form = UserCreationForm()
    return render(request, "registration/signup.html", {"form": form})
