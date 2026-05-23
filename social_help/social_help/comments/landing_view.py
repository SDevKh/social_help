def landing(request):
    """Landing page for unauthenticated users"""
    if request.user.is_authenticated:
        return redirect("/dashboard/")
    return render(request, "landing.html")
