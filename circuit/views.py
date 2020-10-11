import json
from django.shortcuts import render, HttpResponseRedirect, HttpResponse
from django.http import JsonResponse
from django.urls import reverse
from .models import Circuit
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
def index(request):
    return render(request, "circuit/capstone.html")

def indexProject(request, title):
    return render(request, "circuit/capstone.html")

@csrf_exempt
def save(request, title):
    if(request.method == "POST"):
        if Circuit.objects.filter(title=title).count() > 0:
            return JsonResponse({"message":"Unsuccessful"}, status=400)
        else:
            circuit = Circuit(
                title=title,
                nots=str(request.body,'utf-8')
            )
            circuit.save()
            return JsonResponse({"message":"Successful"}, status=201)
    return JsonResponse({"message":"Unsuccessful"}, status=400)

@csrf_exempt
def project(request, title):
    try:
        circuit = Circuit.objects.get(title=title)
    except Circuit.DoesNotExist:
        return JsonResponse({"error": "Project doesn't exist."})
    return JsonResponse({"project": circuit.nots })

@csrf_exempt
def update(request, title):
    if(request.method == "POST"):
        try:
            circuit = Circuit.objects.get(title=title)
        except Circuit.DoesNotExist:
            return JsonResponse({"message":"Unsuccessful"}, status=400)
        print(circuit.title)
        circuit.nots = str(request.body,'utf-8')
        circuit.save()
        return JsonResponse({"message":"Successful"}, status=201)
    return JsonResponse({"message":"Unsuccessful"}, status=400)
    
@csrf_exempt
def circuits(request, page, search):
    if search=="null":
        search = ""
    circuits = []
    try:
        circuits = Circuit.objects.filter(title__contains=search).order_by('-timestamp')[page*10:(page+1)*10+1]
    except:
        pass
    return JsonResponse([circuit.serialize() for circuit in circuits], safe=False)
    
    