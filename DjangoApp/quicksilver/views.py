# -*- coding: utf-8 -*-

from django.views.generic.base import TemplateView
from quicksilver.decorations.set_variable import setTplViewVariable
import logging

logger = logging.getLogger(__name__)

# Create your views here.
class HomeView(TemplateView):
    template_name = 'quicksilver/home.html'

    @setTplViewVariable("appName", "quicksilver")
    @setTplViewVariable("title", "QuickSilver")
    def get_context_data(self, **kwargs):
        logger.info("get_context_data")
        context = super(HomeView, self).get_context_data(**kwargs)
        return context


class AngularTplView(TemplateView):
    def get_context_data(self, **kwargs):
        self.template_name = "quicksilver/tpl/" + kwargs['page_name'] + ".html"
        return super(AngularTplView, self).get_context_data(**kwargs)