from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("<str:title>/save", views.save, name="save"),
    path("<str:title>", views.indexProject, name="indexProject"),
    path("project/<str:title>", views.project, name="project"),
    path("circuits/<int:page>/<str:search>", views.circuits, name="circuits"),
    path("<str:title>/update", views.update, name="update")
]