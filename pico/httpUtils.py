import json


def get_request_method(request):
    return request[request.find('\'') + 1:request.find(' ')]


def get_request_path(request):
    return request.split(' ', 2)[1]


def extract_search_parameters(http_path):
    search_start_index = http_path.find('?')

    if search_start_index != -1:
        search_params_string = http_path[search_start_index + 1:]

        search_params = search_params_string.split('&')

        parameters = {}
        for param in search_params:
            key, value = param.split('=')
            parameters[key] = value

        return parameters
    else:
        return {}


def write_array_response(array):
    return json.dumps([ob.__dict__ for ob in array])


def write_response(obj):
    return json.dumps(obj.__dict__)
