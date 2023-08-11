import json


def get_request_method(request):
    """
    Determines the current request methode based on a given request string.
    :param request: the complete request as string.
    :return: the request methode.
    """
    return request[request.find('\'') + 1:request.find(' ')]


def get_request_path(request):
    """
    Gets the current request path based on a given request string.
    :param request: the complete request as string.
    :return: the request path.
    """
    return request.split(' ', 2)[1]


def write_array_response(array):
    """

    :param array:
    :return:
    """
    return json.dumps([ob.__dict__ for ob in array])


def write_response(obj):
    return json.dumps(obj.__dict__)
